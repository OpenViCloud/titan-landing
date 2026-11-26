---
title: SSH keys and logging in
description: Add an SSH public key, pick it when you create a VM, and log in with the CLI or over SSH.
---

SSH keys are under **Account → SSH keys** in the left sidebar.

## Add an SSH key

1. On the **SSH keys** page, click **Add SSH key**.
2. Fill in **Name**, at most 64 characters.
3. Paste the public key into **Public key** — one public key line, for example the content of `~/.ssh/id_ed25519.pub`.
4. Click **Add SSH key**.

The portal shows "SSH key added" and the key appears in the table, with columns **Name**, **Type**, **Fingerprint** and **Added**. The fingerprint is `SHA256:…`, the same value `ssh-keygen -lf` prints. Only the key type and the key data are kept; any trailing comment on the pasted line is dropped.

Accepted key types: `ssh-ed25519`, `ecdsa-sha2-nistp256`, `ecdsa-sha2-nistp384`, `ecdsa-sha2-nistp521`, and `ssh-rsa` with a key size from 2048 to 16384 bits.

### When adding a key is refused

| Message in the portal | Error code | Meaning |
|---|---|---|
| This key is already saved | `SSH_KEY_EXISTS` | You already have this exact key. |
| A key with this name already exists | `SSH_KEY_NAME_TAKEN` | You already have another key with this name. |
| SSH key limit reached — delete a key first | `SSH_KEY_QUOTA_EXCEEDED` | You have reached the number of SSH keys allowed. The default is 20 keys per account. |
| Not an accepted public key. Use ed25519, ecdsa, or RSA of at least 2048 bits. | `VALIDATION_ERROR` | The pasted text is not one of the accepted key types or sizes. |

## Pick keys when you create a VM

In the [Create VM](/docs/guides/vm/) dialog, click the button under **SSH keys** in **Access (optional)** (it reads *None picked* until you pick one) to open the list of your keys, then tick the ones to add. Pick up to 10 keys per VM. Picked keys are installed only once, early in the VM's first boot, into `/etc/ssh/openvicloud/ubuntu`, a file the VM's SSH server reads for the `ubuntu` user next to `~/.ssh/authorized_keys`.

To add a key to a VM that is already running, use [Add an SSH key to a running VM](/docs/guides/vm/#add-an-ssh-key-to-a-running-vm) on the VM's page, or `openvicloud vm add-ssh-key` in the [CLI](/docs/guides/cli/#add-an-ssh-key-to-a-vm). A VM created earlier without any SSH key may need to be stopped and started for the added key to take effect — the portal and the CLI tell you when this applies; a VM that already had a key, or was created with one, gets the new key right away. Deleting a key does not remove it from VMs that already have it — remove its line from `/etc/ssh/openvicloud/ubuntu` inside the VM (with `sudo`) if you need to; it does not come back at the next boot.

The only template offered to customers today is **Ubuntu-22.04-Standard**.

## Logging in to a VM

### With the CLI

```
openvicloud vm ssh <vm name or id>
```

This works on any network — the VM needs no public address. The control plane relays the SSH session. The VM must be in the `Running` or `Ready` state. Right after the VM starts, `vm ssh` may fail for a few minutes with `VM_AGENT_NOT_READY` or `VM_SSH_NOT_READY` (see [error codes](/docs/concepts/error-codes/)) while the VM finishes booting; try again shortly.

Up to 5 sessions per account can be open at the same time, and an idle session closes after 30 minutes.

The default login user is `ubuntu` (change it with `--user`). Put extra `ssh` options or a command after `--`, for example:

```
openvicloud vm ssh web-1 -- -i ~/.ssh/id_ed25519
```

See the [CLI guide](/docs/guides/cli/) to install `openvicloud` and log in.

### Direct SSH over public IPv6

```
ssh ubuntu@<the VM's Public IPv6 address>
```

This only works for a VM on a network with public IPv6 enabled (see [public IPv6](/docs/guides/public-ipv6/)), and only once the network lets TCP port 22 in: a new network blocks inbound traffic, so add an Ingress TCP 22 [firewall rule](/docs/guides/firewall/) first — from `::/0`, or only from your own IPv6 range.

The portal itself has no button to open an SSH session. Its **Console** tab opens the VM's serial console instead — see [the VM console](/docs/guides/vm/#open-the-vms-console).
