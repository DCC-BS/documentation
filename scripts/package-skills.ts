import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
import { readdir } from "node:fs/promises";

const SRC_DIR = path.resolve("markdown");
const DIST_DIR = path.resolve(".vitepress/dist");
const SKILLS_BUILD_DIR = path.resolve("temp-skills");

interface ParsedFile {
  filePath: string;
  content: string;
  skillName?: string;
  skillDescription?: string;
  skillParent?: string;
  skillInline?: boolean;
}

interface ParentInfo {
  name: string;
  description: string;
  file?: ParsedFile;
}

type Parents = Map<string, ParentInfo>;
type Children = Map<string, ParsedFile[]>;

/** Strip a leading `---`-delimited YAML frontmatter block, returning the body. */
function stripFrontmatter(fileContent: string): string {
  return fileContent.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== "public" && entry.name !== ".vitepress") {
        files.push(...(await getMarkdownFiles(fullPath)));
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontmatter(fileContent: string): Record<string, string> {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  
  const yamlText = match[1];
  const metadata: Record<string, string> = {};
  
  for (const line of yamlText.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let val = line.slice(colonIndex + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      metadata[key] = val;
    }
  }
  return metadata;
}

/** Read every markdown file and extract its skill frontmatter. */
async function parseAllFiles(files: string[]): Promise<ParsedFile[]> {
  const parsedFiles: ParsedFile[] = [];
  for (const file of files) {
    const content = await Bun.file(file).text();
    const frontmatter = parseFrontmatter(content);

    parsedFiles.push({
      filePath: file,
      content,
      skillName: frontmatter.skillName || frontmatter.skill_name,
      skillDescription: frontmatter.skillDescription || frontmatter.skill_description,
      skillParent: frontmatter.skillParent || frontmatter.skill_parent,
      skillInline: (frontmatter.skillInline || frontmatter.skill_inline) === "true",
    });
  }
  return parsedFiles;
}

/** Register a child under its parent, synthesizing a fallback parent if none was declared. */
function registerChild(pf: ParsedFile, parents: Parents, children: Children): void {
  const parentId = pf.skillParent;
  if (!parentId) return;

  const siblings = children.get(parentId) ?? [];
  siblings.push(pf);
  children.set(parentId, siblings);

  if (!parents.has(parentId)) {
    console.warn(
      `⚠️  Sub-skill "${pf.skillName}" references parent "${parentId}", but no top-level skill defines it. Generating a fallback parent — check for a typo in skillParent.`,
    );
    parents.set(parentId, {
      name: parentId,
      description: `Guidelines and helper files for the ${parentId} module.`,
    });
  }
}

/** Group parsed files into top-level skills (parents) and their child sub-skills. */
function discoverSkills(parsedFiles: ParsedFile[]): { parents: Parents; children: Children } {
  const parents: Parents = new Map();
  const children: Children = new Map();

  for (const pf of parsedFiles) {
    if (pf.skillName && pf.skillDescription && !pf.skillParent) {
      parents.set(pf.skillName, { name: pf.skillName, description: pf.skillDescription, file: pf });
    }
  }

  for (const pf of parsedFiles) {
    if (pf.skillParent && pf.skillName && pf.skillDescription) {
      registerChild(pf, parents, children);
    }
  }

  // Deterministic ordering so the generated SKILL.md sitemaps don't churn between runs
  for (const list of children.values()) {
    list.sort((a, b) => (a.skillName ?? "").localeCompare(b.skillName ?? ""));
  }

  return { parents, children };
}

/**
 * Surface the parent guide (index.md):
 *  - skillInline: true → fold its body straight into SKILL.md (always loaded)
 *  - otherwise         → keep it as references/index.md and link it from the sitemap
 */
async function surfaceParentGuide(
  parentInfo: ParentInfo,
  refDir: string,
): Promise<{ inlineBody: string; hasIndexReference: boolean }> {
  if (!parentInfo.file) {
    await writeFile(path.join(refDir, "index.md"), `# ${parentInfo.name}\n\n${parentInfo.description}\n`);
    return { inlineBody: "", hasIndexReference: true };
  }
  if (parentInfo.file.skillInline) {
    return { inlineBody: stripFrontmatter(parentInfo.file.content).trim(), hasIndexReference: false };
  }
  await cp(parentInfo.file.filePath, path.join(refDir, "index.md"));
  return { inlineBody: "", hasIndexReference: true };
}

/** Build the SKILL.md sitemap and copy child references into refDir. Returns the count of children compiled. */
async function buildSitemap(
  childSkills: ParsedFile[],
  hasIndexReference: boolean,
  refDir: string,
): Promise<{ sitemap: string; subSkillsCount: number }> {
  if (childSkills.length === 0) {
    if (!hasIndexReference) return { sitemap: "", subSkillsCount: 0 };
    return {
      sitemap:
        `\n### Reference Guidelines\n` +
        `Detailed guidelines are available in the \`references/index.md\` file inside this skill.\n`,
      subSkillsCount: 0,
    };
  }

  let sitemap = `\n### Reference Sub-Guidelines\n`;
  sitemap += `The following reference sub-guides are available in this skill directory. Read them using your file reading tools as needed:\n\n`;
  if (hasIndexReference) {
    sitemap += `- **[Overview](references/index.md)**: Module overview, setup, and shared conventions.\n`;
  }

  let subSkillsCount = 0;
  for (const child of childSkills) {
    sitemap += `- **[${child.skillName}](references/${child.skillName}.md)**: ${child.skillDescription}\n`;
    await cp(child.filePath, path.join(refDir, `${child.skillName}.md`));
    subSkillsCount++;
    console.log(`  └─ Compiled sub-skill reference: ${child.skillName}`);
  }
  return { sitemap, subSkillsCount };
}

/** Generate one top-level skill directory (SKILL.md + references). Returns the count of children compiled. */
async function buildSkill(
  skillsDir: string,
  parentId: string,
  parentInfo: ParentInfo,
  childSkills: ParsedFile[],
): Promise<number> {
  console.log(`- Building skill: ${parentId}`);
  const skillPath = path.join(skillsDir, parentId);
  const refDir = path.join(skillPath, "references");
  await mkdir(refDir, { recursive: true });

  const { inlineBody, hasIndexReference } = await surfaceParentGuide(parentInfo, refDir);
  const { sitemap, subSkillsCount } = await buildSitemap(childSkills, hasIndexReference, refDir);

  // The description is JSON.stringify'd so colons, brackets and other YAML
  // metacharacters in the text don't produce an invalid SKILL.md frontmatter
  // (skill consumers parse this with a real YAML parser).
  const skillMdContent = `---
name: ${parentId}
description: ${JSON.stringify(parentInfo.description)}
---

# ${parentInfo.name}

${parentInfo.description}
${inlineBody ? `\n${inlineBody}\n` : ""}${sitemap}
`;

  await writeFile(path.join(skillPath, "SKILL.md"), skillMdContent);
  return subSkillsCount;
}

/** Archive the built .agents directory into dcc-skills.zip and clean up. */
async function packageArchive(): Promise<void> {
  await mkdir(DIST_DIR, { recursive: true });

  // Remove any stale archive first — `zip` appends to existing files.
  const zipPath = path.join(DIST_DIR, "dcc-skills.zip");
  await rm(zipPath, { force: true });
  console.log("Archiving .agents directory to dcc-skills.zip...");
  execSync(`cd ${SKILLS_BUILD_DIR} && zip -r ${zipPath} .agents`);

  await rm(SKILLS_BUILD_DIR, { recursive: true, force: true });
  console.log("🎉 Skills packaging completed! Created dcc-skills.zip in .vitepress/dist/");
}

async function main() {
  console.log("Scanning markdown files recursively for parent and child skills...");
  const parsedFiles = await parseAllFiles(await getMarkdownFiles(SRC_DIR));
  const { parents, children } = discoverSkills(parsedFiles);

  // Setup fresh build folders
  await rm(SKILLS_BUILD_DIR, { recursive: true, force: true });
  const skillsDir = path.join(SKILLS_BUILD_DIR, ".agents/skills");
  await mkdir(skillsDir, { recursive: true });

  let skillsCount = 0;
  let subSkillsCount = 0;
  const sortedParents = [...parents.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [parentId, parentInfo] of sortedParents) {
    subSkillsCount += await buildSkill(skillsDir, parentId, parentInfo, children.get(parentId) || []);
    skillsCount++;
  }

  console.log(`🎉 Success! Compiled ${skillsCount} top-level skills with ${subSkillsCount} sub-skill references.`);

  if (skillsCount === 0) {
    console.error("❌ No skills were compiled. Check that markdown files declare skillName/skillDescription frontmatter.");
    process.exit(1);
  }

  await packageArchive();
}

try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
