# How to Encrypt Environment Files

This guide covers how to securely encrypt environment variables using `dotenvx` and store encryption keys using ProtonPass.

## Overview

Environment files often contain sensitive information like API keys, database credentials, and other secrets. Encrypting these files ensures that sensitive data is not exposed in your repository or during deployment.

This guide uses:
- **[dotenvx](https://dotenvx.com/)** - A tool for encrypting and managing environment variables
- **[ProtonPass CLI](https://protonpass.github.io/pass-cli/)** - A command-line interface for ProtonPass password manager

This method is also compatible with other password managers like:
- 1Password ([1Password CLI](https://developer.1password.com/docs/cli/))
- Bitwarden ([Bitwarden CLI](https://bitwarden.com/help/cli/))
- Dashlane ([Dashlane CLI](https://cli.dashlane.com/))

## Prerequisites

Install the required tools:

```bash
# Install dotenvx
npm install -g @dotenvx/dotenvx

# Install ProtonPass CLI
# See: https://protonpass.github.io/pass-cli/
```

## Basic dotenvx Usage

### Encrypting an Entire File

To encrypt a `.env` file and create an encrypted `.env.enc` file:

```bash
dotenvx encrypt .env
```

This command will:
1. Read your `.env` file
2. Generate an encrypted `.env.enc` file
3. Create a private encryption key (stored in `.env.keys`)

### Setting Individual Values

Set a single encrypted environment variable:

```bash
dotenvx set KEY VALUE
```

**Example:**
```bash
dotenvx set DATABASE_PASSWORD "my-secret-password"
```

### Getting Encrypted Values

Retrieve an encrypted value:

```bash
dotenvx get KEY
```

**Example:**
```bash
dotenvx get DATABASE_PASSWORD
```

### Decrypting Individual Values

Decrypt a single value using its key:

```bash
dotenvx decrypt -k KEY
```

### Encrypting Individual Values

Encrypt a specific key-value pair:

```bash
dotenvx encrypt -k KEY
```

## Secure Key Storage with ProtonPass

Instead of storing encryption keys in a local `.env.keys` file, use ProtonPass for enhanced security.

### Setting Up ProtonPass Integration

1. **Ensure you are logged in to ProtonPass CLI:**

```bash
# Login if not already authenticated
pass-cli login

# Verify authentication
pass-cli test
```

2. **Create an item in ProtonPass** containing your encryption key:
   - Vault: Your chosen vault name (e.g., `DCCB-BS`)
   - Item: Item name (e.g., `DOTENV_PRIVATE_KEY`)
   - Field: Field name (e.g., `Secret`)

3. **Create a `.env.keys` file** with a ProtonPass secret reference:

```bash
DOTENV_PRIVATE_KEY=pass://[Vault]/[Item]/[FieldName]
```

**Example:**
```bash
DOTENV_PRIVATE_KEY=pass://DCCB-BS/DOTENV_PRIVATE_KEY/Secret
```

For more information on secret references, see the [ProtonPass CLI documentation](https://protonpass.github.io/pass-cli/commands/contents/secret-references/).

### Running Commands with ProtonPass

Execute dotenvx commands using ProtonPass to retrieve the encryption key:

```bash
pass-cli run --env-file .env.keys -- dotenvx [COMMAND]
```

**Example:**
```bash
pass-cli run --env-file .env.keys -- dotenvx get DATABASE_PASSWORD
```

## Workflow Optimization with Aliases

To simplify your workflow, create shell aliases in your configuration file (`.bashrc`, `.zshrc`, etc.):

```bash
# Alias for running dotenvx with ProtonPass
alias envx="pass-cli run --env-file .env.keys -- dotenvx"

# Alias for running commands with encrypted environment variables
alias renv="envx run --"
```

After adding these aliases, reload your shell configuration:

```bash
source ~/.bashrc  # or ~/.zshrc
```

### Using the Aliases

With the aliases configured, you can run commands much more easily:

```bash
# Run your development server with encrypted environment variables
renv bun dev

# Or with other commands
renv npm start
renv python app.py
renv node server.js
```

## Complete Workflow Example

Here's a complete example of setting up and using encrypted environment variables:

### Initial Setup

```bash
# 1. Login to ProtonPass CLI
pass-cli login

# 2. Create your .env file
echo "DATABASE_URL=postgresql://user:pass@localhost/db" > .env
echo "API_KEY=secret-key-123" >> .env

# 3. Encrypt the file
dotenvx encrypt .env

# 4. Store the encryption key in ProtonPass
# (Do this manually in ProtonPass UI or CLI)

# 5. Create .env.keys file
echo "DOTENV_PRIVATE_KEY=pass://MyVault/DOTENV_PRIVATE_KEY/Secret" > .env.keys

# 6. Add .env and .env.keys to .gitignore
echo ".env" >> .gitignore
echo ".env.keys" >> .gitignore
```

### Daily Usage

```bash
# Run your application with encrypted variables
renv bun dev

# Update an environment variable
envx set API_KEY "new-secret-key-456"

# View a decrypted value
envx get API_KEY
```

## Best Practices
- Only encrypt sensitive environment variables. Keep non-sensitive variables in plain text if needed.
- For open source projects, avoid committing `.env` and `.env.keys` files to version control.
- For private team project the `.env` file and `.env.keys` file can be commited securely and the private key can be shared via a Pasword Manager.

## Additional Resources

- [dotenvx Documentation](https://dotenvx.com/)
- [ProtonPass CLI Documentation](https://protonpass.github.io/pass-cli/)
- [dotenvx GitHub Repository](https://github.com/dotenvx/dotenvx)
- [ProtonPass Secret References](https://protonpass.github.io/pass-cli/commands/contents/secret-references/)
