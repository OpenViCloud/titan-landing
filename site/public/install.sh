#!/bin/sh
# Installs openvicloud, the OpenViCloud command-line tool, on macOS or Linux:
#
#   curl -fsSL <site>/install.sh | sh
#
# The binary comes from the latest release of OpenViCloud/cli, the same on every site
# (docs/features/cli/design.md#install-script). Everything runs from main, called on the last line, so a download cut
# short runs nothing.

fail() {
  echo "openvicloud install: $1" >&2
  exit 1
}

main() {
  release='https://github.com/OpenViCloud/cli/releases/latest/download'
  guide='https://github.com/OpenViCloud/cli#install'

  system=$(uname -s)
  case "$system" in
    Darwin) os=darwin ;;
    Linux) os=linux ;;
    MINGW* | MSYS* | CYGWIN*) fail "on Windows, download openvicloud-windows-<arch>.exe by hand: see $guide" ;;
    *) fail "$system is not supported: see $guide" ;;
  esac

  machine=$(uname -m)
  case "$machine" in
    x86_64 | amd64) arch=amd64 ;;
    arm64 | aarch64) arch=arm64 ;;
    *) fail "the $machine processor is not supported: see $guide" ;;
  esac

  file="openvicloud-$os-$arch"
  tmp=$(mktemp -d) || fail "cannot create a temporary folder"
  trap 'rm -rf "$tmp"' EXIT

  echo "Downloading $file from $release"
  curl -fsSL -o "$tmp/$file" "$release/$file" || fail "cannot download $release/$file"
  curl -fsSL -o "$tmp/SHA256SUMS" "$release/SHA256SUMS" || fail "cannot download $release/SHA256SUMS"

  expected=$(awk -v name="$file" '$2 == name { print $1 }' "$tmp/SHA256SUMS")
  if [ -z "$expected" ]; then
    fail "checksum: SHA256SUMS has no line for $file; nothing was installed"
  fi
  if command -v sha256sum >/dev/null 2>&1; then
    actual=$(sha256sum "$tmp/$file" | awk '{ print $1 }')
  elif command -v shasum >/dev/null 2>&1; then
    actual=$(shasum -a 256 "$tmp/$file" | awk '{ print $1 }')
  else
    fail "neither sha256sum nor shasum is installed, so the download cannot be checked; nothing was installed"
  fi
  if [ "$expected" != "$actual" ]; then
    fail "checksum mismatch: $file does not match its line in SHA256SUMS; nothing was installed"
  fi

  # Tests point OPENVICLOUD_SYSTEM_BIN at a folder they control; it is not an option for customers.
  system_bin="${OPENVICLOUD_SYSTEM_BIN:-/usr/local/bin}"
  if [ -d "$system_bin" ] && [ -w "$system_bin" ]; then
    bin="$system_bin"
  else
    bin="$HOME/.local/bin"
    mkdir -p "$bin" || fail "cannot create $bin"
  fi

  chmod +x "$tmp/$file" || fail "cannot make $file executable"
  mv "$tmp/$file" "$bin/openvicloud" || fail "cannot write $bin/openvicloud"
  echo "Installed $bin/openvicloud"
  "$bin/openvicloud" version || fail "$bin/openvicloud was installed but does not run"

  case ":$PATH:" in
    *":$bin:"*) ;;
    *)
      echo ""
      echo "$bin is not on your PATH. Add this line to your shell profile (for example ~/.zshrc or ~/.profile):"
      echo "  export PATH=\"$bin:\$PATH\""
      ;;
  esac
}

main "$@"
