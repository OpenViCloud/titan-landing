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

The [Create VM](/docs/guides/vm/) dialog has an **SSH keys** checkbox group. Pick up to 10 keys per VM. Picked keys are installed only once, at the VM's first boot, into the `ubuntu` user's `authorized_keys`. You cannot add a key to a VM after it is created from the portal, and deleting a key does not remove it from VMs that already have it — remove it inside the VM if you need to.

The only template offered to customers today is **Ubuntu-22.04-Standard**.

## Logging in to a VM

### With the CLI

```
openvicloud vm ssh <vm name or id>
```

This works on any network — the VM needs no public address. The control plane relays the SSH session. The VM must be in the `Running` or `Ready` state. Right after the VM boots, a session may end at once; try again shortly.

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

This only works for a VM on a network with public IPv6 enabled (see [public IPv6](/docs/guides/public-ipv6/)). On such a network, every port of the VM is open to the Internet, and firewall rules created from the portal cannot close any port yet — see [known limitations](/docs/known-limitations/) and [firewall rules](/docs/guides/firewall/).

The portal itself has no button to open a shell and no web console.
