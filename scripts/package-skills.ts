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

async function main() {
  console.log("Scanning markdown files recursively for parent and child skills...");
  const allFiles = await getMarkdownFiles(SRC_DIR);
  
  const parsedFiles: ParsedFile[] = [];
  for (const file of allFiles) {
    const content = await Bun.file(file).text();
    const frontmatter = parseFrontmatter(content);
    
    parsedFiles.push({
      filePath: file,
      content,
      skillName: frontmatter.skillName || frontmatter.skill_name,
      skillDescription: frontmatter.skillDescription || frontmatter.skill_description,
      skillParent: frontmatter.skillParent || frontmatter.skill_parent,
    });
  }

  // Setup fresh build folders
  await rm(SKILLS_BUILD_DIR, { recursive: true, force: true });
  await mkdir(SKILLS_BUILD_DIR, { recursive: true });
  const skillsDir = path.join(SKILLS_BUILD_DIR, ".agents/skills");
  await mkdir(skillsDir, { recursive: true });

  // Map to group children under parents
  const parents = new Map<string, { name: string; description: string; file?: ParsedFile }>();
  const children = new Map<string, ParsedFile[]>();

  // 1. Discover parents and children
  for (const pf of parsedFiles) {
    if (pf.skillName && pf.skillDescription && !pf.skillParent) {
      // Top-level skill (could be standalone or a parent)
      parents.set(pf.skillName, {
        name: pf.skillName,
        description: pf.skillDescription,
        file: pf,
      });
    }
  }

  for (const pf of parsedFiles) {
    if (pf.skillParent && pf.skillName && pf.skillDescription) {
      // This is a child sub-skill
      const parentId = pf.skillParent;
      if (!children.has(parentId)) {
        children.set(parentId, []);
      }
      children.get(parentId)!.push(pf);

      // If the parent metadata wasn't explicitly defined in any index file, generate a fallback
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
  }

  // Deterministic ordering so the generated SKILL.md sitemaps don't churn between runs
  for (const list of children.values()) {
    list.sort((a, b) => (a.skillName ?? "").localeCompare(b.skillName ?? ""));
  }

  // 2. Generate and package each top-level skill
  let skillsCount = 0;
  let subSkillsCount = 0;

  const sortedParents = [...parents.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [parentId, parentInfo] of sortedParents) {
    console.log(`- Building skill: ${parentId}`);
    
    const skillPath = path.join(skillsDir, parentId);
    await mkdir(skillPath, { recursive: true });
    
    const refDir = path.join(skillPath, "references");
    await mkdir(refDir, { recursive: true });

    // Gather children
    const childSkills = children.get(parentId) || [];
    
    // Write parent guide file if it exists, otherwise generate fallback
    if (parentInfo.file) {
      await cp(parentInfo.file.filePath, path.join(refDir, "index.md"));
    } else {
      await writeFile(path.join(refDir, "index.md"), `# ${parentInfo.name}\n\n${parentInfo.description}\n`);
    }

    // Build sitemap for SKILL.md
    let sitemap = "";
    if (childSkills.length > 0) {
      sitemap += `\n### Reference Sub-Guidelines\n`;
      sitemap += `The following reference sub-guides are available in this skill directory. Read them using your file reading tools as needed:\n\n`;
      
      for (const child of childSkills) {
        const relativeLink = `references/${child.skillName}.md`;
        sitemap += `- **[${child.skillName}](${relativeLink})**: ${child.skillDescription}\n`;
        
        // Copy the child file into references
        await cp(child.filePath, path.join(refDir, `${child.skillName}.md`));
        subSkillsCount++;
        console.log(`  └─ Compiled sub-skill reference: ${child.skillName}`);
      }
    } else {
      sitemap += `\n### Reference Guidelines\n`;
      sitemap += `Detailed guidelines are available in the \`references/index.md\` file inside this skill.\n`;
    }

    // Write primary entrypoint SKILL.md.
    // The description is JSON.stringify'd so colons, brackets and other YAML
    // metacharacters in the text don't produce an invalid SKILL.md frontmatter
    // (skill consumers parse this with a real YAML parser).
    const skillMdContent = `---
name: ${parentId}
description: ${JSON.stringify(parentInfo.description)}
---

# ${parentInfo.name}

${parentInfo.description}
${sitemap}
`;

    await writeFile(path.join(skillPath, "SKILL.md"), skillMdContent);
    skillsCount++;
  }

  console.log(`🎉 Success! Compiled ${skillsCount} top-level skills with ${subSkillsCount} sub-skill references.`);

  if (skillsCount === 0) {
    console.error("❌ No skills were compiled. Check that markdown files declare skillName/skillDescription frontmatter.");
    process.exit(1);
  }

  // Ensure output directory exists
  await mkdir(DIST_DIR, { recursive: true });

  // Package into zip file (remove any stale archive first — `zip` appends to existing files)
  const zipPath = path.join(DIST_DIR, "dcc-skills.zip");
  await rm(zipPath, { force: true });
  console.log("Archiving .agents directory to dcc-skills.zip...");
  execSync(`cd ${SKILLS_BUILD_DIR} && zip -r ${zipPath} .agents`);

  // Clean up build directory
  await rm(SKILLS_BUILD_DIR, { recursive: true, force: true });
  console.log("🎉 Skills packaging completed! Created dcc-skills.zip in .vitepress/dist/");
}

main().catch(console.error);
