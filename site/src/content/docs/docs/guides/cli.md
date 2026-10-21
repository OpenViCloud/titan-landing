---
title: Command-line tool
description: Download, verify and install the openvicloud CLI, log in, create and manage VMs and SSH keys, and open an SSH session.
---

`openvicloud` is the command-line client of OpenViCloud. It can log you in, show your [account](/docs/guides/account/) (which the CLI calls a tenant), list the zones, templates and sizes you can pick, create and manage VMs and SSH keys, and open an SSH session to a VM. Networks, volumes, snapshots, firewall rules and load balancers, and paying invoices or topping up your wallet, are done on the portal.

## Install with one command

On macOS or Linux, run:

```bash
curl -fsSL https://site-staging.openvicloud.com/install.sh | sh
```

The script picks the file for your operating system and processor, downloads it with `SHA256SUMS` from the CLI's latest release on GitHub, and installs nothing if the file does not match its line in `SHA256SUMS`. It puts `openvicloud` in `/usr/local/bin` when it can write there, otherwise in `~/.local/bin`, and never asks for `sudo`. Then it runs `openvicloud version`, and if the folder it installed into is not on your `PATH`, it prints the line to add to your shell profile.

A file downloaded with `curl` carries no quarantine flag, so macOS runs it without the `xattr` step of the [manual install](#install).

On Windows, or to install by hand, follow the steps below.

## Download

The CLI is published on GitHub: every file below comes from the [latest release](https://github.com/OpenViCloud/cli/releases/latest) of [OpenViCloud/cli](https://github.com/OpenViCloud/cli), where its source code is too. Pick the file for your operating system and processor.

| OS | Architecture | Download |
|---|---|---|
| macOS | Apple silicon | [openvicloud-darwin-arm64](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-darwin-arm64) |
| macOS | Intel | [openvicloud-darwin-amd64](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-darwin-amd64) |
| Linux | x86_64 | [openvicloud-linux-amd64](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-linux-amd64) |
| Linux | arm64 | [openvicloud-linux-arm64](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-linux-arm64) |
| Windows | x86_64 | [openvicloud-windows-amd64.exe](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-windows-amd64.exe) |
| Windows | arm64 | [openvicloud-windows-arm64.exe](https://github.com/OpenViCloud/cli/releases/latest/download/openvicloud-windows-arm64.exe) |

Also download [SHA256SUMS](https://github.com/OpenViCloud/cli/releases/latest/download/SHA256SUMS) into the same folder as the binary, to check the download in the next step.

## Check the download

Checksums let you confirm the file downloaded completely and matches the one published with it.

**macOS**, in the folder where you downloaded both files:

```bash
shasum -a 256 -c SHA256SUMS --ignore-missing
```

**Linux**, in the same folder:

```bash
sha256sum -c SHA256SUMS --ignore-missing
```

**Windows**, in PowerShell:

```powershell
Get-FileHash .\openvicloud-windows-amd64.exe -Algorithm SHA256
```

(use the file name you downloaded). PowerShell prints the hash in uppercase; `SHA256SUMS` lists it in lowercase. Compare the two letter by letter, ignoring case.

On macOS or Linux, a correct download prints a line ending in `OK`, for example `openvicloud-darwin-arm64: OK`. The `--ignore-missing` flag skips the lines for files you did not download, instead of failing on them.

### Check the signature (optional)

`SHA256SUMS` is signed with the OpenViCloud release key, fingerprint `BB74 B8EC F2BA A232 1296  E3BA 6200 9A5A 7C77 9F46`. With GnuPG installed, download the signature and the public key into the same folder and check:

```bash
curl -fsSLO https://github.com/OpenViCloud/cli/releases/latest/download/SHA256SUMS.sig
curl -fsSLO https://raw.githubusercontent.com/OpenViCloud/cli/main/openvicloud-release.asc
gpg --import openvicloud-release.asc
gpg --verify SHA256SUMS.sig SHA256SUMS
```

A correct file prints `Good signature from "OpenViCloud Release <sysadmin@openvicloud.com>"`. GnuPG may add a warning that the key is not certified by a trusted signature: compare the fingerprint it prints with the one above.

## Install

**macOS and Linux**

1. Make the file executable and rename it:
   ```bash
   chmod +x openvicloud-darwin-arm64
   mv openvicloud-darwin-arm64 openvicloud
   ```
   (use the file name you downloaded)
   The binary has no Apple code signature. On macOS, a file downloaded with a browser carries a quarantine flag, and macOS stops the file as soon as it starts: the terminal only prints `killed`. Remove the flag before moving the file:
   ```bash
   xattr -d com.apple.quarantine openvicloud
   ```
2. Move it to a directory on your `PATH`, for example:
   ```bash
   sudo mv openvicloud /usr/local/bin/
   ```

**Windows**

1. Rename the downloaded file to `openvicloud.exe`.
2. Move it to a folder that is on your `PATH`.

## Log in

```bash
openvicloud auth login
```

The CLI prints a page to open and a code to check, tries to open your browser to that page, then waits:

```
To log in, open this page and check that it shows the code <CODE>:
  <login page URL>
Waiting for you to confirm in the browser...
```

Sign in to OpenViCloud on that page and confirm the code. The CLI then prints:

```
Logged in to <api> as <username>
```

If you decline the code in the browser, the CLI reports that the login was refused and nothing was saved. If you take too long and the code expires, it tells you to run `openvicloud auth login` again.

You must have accepted the current terms of service in the portal before commands that talk to your account (such as `tenant get` and `vm ssh`) will run. If you have not, the command stops with:

```
you have not accepted the current terms of service: accept them at <portal>, then run the command again
```

If you log in before accepting them, `auth login` still succeeds, and the CLI adds a reminder:

```
Before you use the CLI, accept the current terms of service at <portal>
```

See [sign up and get approved](/docs/guides/sign-up/) for the terms-of-service step.

Once logged in, your login lasts as long as you run a command that uses your account (such as `tenant get` or `vm ssh`) at least once every 30 days; the CLI renews it when needed, without asking you to log in again. The session is stored in a file at `~/.config/openvicloud/session.json` (on Windows, under your user profile folder), or under `$XDG_CONFIG_HOME/openvicloud/` instead if you have that variable set. On macOS and Linux, that folder and file are set so only you can read them.

Other account commands:

- `openvicloud auth status` — shows who you are logged in as and which API and login server you are using.
- `openvicloud auth logout` — revokes the session and deletes it from your computer. If the server cannot confirm the revoke, the file is still deleted, and the command ends with an error saying the session may still be valid on the server until it expires.

## Use an API token instead of logging in

For CI jobs and scripts, which cannot open a browser, create an [API token](/docs/guides/api-tokens/) on the portal and set it in the environment:

```bash
export OPENVICLOUD_TOKEN=ovc_...
openvicloud vm list
```

While `OPENVICLOUD_TOKEN` is set, every command — `vm ssh` included — uses the token and ignores the saved login session (which stays on disk). If the API refuses the token, the command says the token in `OPENVICLOUD_TOKEN` was refused (deleted, expired, or mistyped) instead of asking you to log in. The terms-of-service check still applies.

## Commands available today

- `openvicloud auth login` / `logout` / `status`
- `openvicloud tenant get` — shows your tenant: ID, name, status, max VMs, max networks, and when it was created.
- `openvicloud zone list` / `template list [--zone <zone>]` / `size list` — what you can pick when you create a VM. `size list` shows each size's vCPUs, memory and price per hour in VND.
- `openvicloud vm list` / `get` / `create` / `rename` / `start` / `stop` / `delete` — see [create and manage VMs](#create-and-manage-vms).
- `openvicloud ssh-key add` / `list` / `delete` — see [SSH keys](#ssh-keys).
- `openvicloud vm ssh <vm name or id>` — opens an SSH session to a VM.
- `openvicloud version` — shows the CLI version and the API and login server it talks to.
- `openvicloud help` and `openvicloud completion` — built-in help and shell autocompletion scripts.

Every command accepts the `-o, --output table` (the default) or `-o, --output json` flag. Commands that print a result (lists, `get`, `tenant get`, `auth status`, `version`, and the ID a create returns) print it in that format; with `json` it is the object the API returned, prices with every digit. Commands that only send a request (`start`, `stop`, `delete`, `rename`) print a line saying the request was sent, which is not part of the output; with `--wait`, `start` and `stop` then print the VM in that format.

Everything else — networks, volumes, snapshots, firewall rules, load balancers, and paying invoices or topping up your wallet — is done on the portal.

## Create and manage VMs

Find what to pick, then create the VM:

```bash
openvicloud zone list
openvicloud template list --zone <zone>
openvicloud size list
openvicloud vm create web-1 --zone <zone> --network <network> --template Ubuntu-22.04-Standard --size <size> --ssh-key laptop
```

`--zone`, `--network`, `--template` and `--size` are required. The network must already exist (create it on the portal). Network, template, size and SSH key can be given by name or by ID. `--ssh-key` can be repeated to add several keys; without one you cannot log in to the VM. `--disk-size <GB>` sets the disk size. If a name does not match, the CLI says which one and creates nothing.

The create prints the new VM's ID. The VM is then created in the background; add `--wait` to wait until it is Running or Ready and print it:

```bash
openvicloud vm create web-1 --zone <zone> --network <network> --template Ubuntu-22.04-Standard --size <size> --ssh-key laptop --wait
```

If the network drops while the create is being sent, the CLI sends it again, up to three sends in all. Each send carries the same request key, so you still get one VM.

Other VM commands take the VM's name or ID:

- `openvicloud vm list` — your VMs (not deleted ones): name, ID, zone, state, the request it is waiting for, IPv4 address.
- `openvicloud vm get <vm>` — one VM in detail, including the reason if its creation failed.
- `openvicloud vm stop <vm>` / `vm start <vm>` — stop a VM, or start a stopped one (`start` also resumes a Frozen VM). A stopped VM is not billed for compute.
- `openvicloud vm rename <vm> <new name>`
- `openvicloud vm delete <vm>` — asks you to type `y` before it deletes the VM and its disk; `--yes` skips the question.

`create`, `start`, `stop` and `delete` take `--wait`, and `--timeout` (default `10m`) to change how long it waits. The CLI checks the VM every 5 seconds until its request is done:

- `create` and `start` succeed when the VM is Running or Ready, `stop` when it is Stopped, `delete` when the VM is deleted.
- If the request ends another way — the creation failed, or the VM is in another state — the command prints why and ends with exit code 1.
- If the time runs out, the command says what the VM is still waiting for and ends with exit code 1; the request itself goes on, and `openvicloud vm get <vm>` shows it.

Without `--wait`, the command returns as soon as the request is accepted. See [VM states](/docs/concepts/vm-states/) for what each state means.

## SSH keys

```bash
openvicloud ssh-key add laptop --public-key-file ~/.ssh/id_ed25519.pub
openvicloud ssh-key list
openvicloud ssh-key delete laptop
```

`add` reads the public key from the file and prints the new key's ID. `list` shows each key's name, ID, type and fingerprint. `delete` asks you to type `y` first (`--yes` skips the question); VMs that already have the key keep it. See [SSH keys](/docs/guides/ssh-keys/) for which key types are accepted and the limits.

## SSH into a VM

```bash
openvicloud vm ssh <vm name or id>
```

This uses the `ssh` program already on your system, so it must be installed and on your `PATH` — otherwise the CLI reports `ssh is not installed or not on PATH`. The VM must:

- have one of your [SSH keys](/docs/guides/ssh-keys/) selected when it was created, and
- be in the **Running** or **Ready** state.

The VM does not need a public address: OpenViCloud relays the session, so this works on any network.

By default the CLI logs in as the `ubuntu` user, which is who your picked SSH key is added for. Use `--user <name>` to log in as someone else.

Anything after `--` is passed to `ssh`, for example to choose a key or run a single command instead of opening a shell:

```bash
openvicloud vm ssh web-1 -- -i ~/.ssh/id_ed25519
openvicloud vm ssh web-1 -- uptime
```

The command's exit code is `ssh`'s own exit code.

Notes:

- Your account can have at most 5 SSH sessions open at the same time (shared across everyone on the account). A session that sits idle for 30 minutes is closed.
- Right after a VM finishes booting, a session can end almost immediately. If that happens, wait a short while and try again.
- If the name or ID does not match one of your VMs, the CLI prints `no VM named "<name>" in your tenant: see your VMs on the portal`.
- If the session is refused for another reason (for example the VM is not Running or Ready), the CLI prints an error. Check the VM's state on the portal and try again once it is Running or Ready.

## Understanding errors

When a command fails, the CLI explains common error codes in its own words — for example, that your account is not a member of a tenant, that your tenant is suspended, or that it is still waiting for approval. If your session is no longer accepted, the CLI tells you to run `openvicloud auth login` again; if you use `OPENVICLOUD_TOKEN`, it says the token was refused.

For the full list of error codes and what they mean, see [error codes](/docs/concepts/error-codes/).
