#!/bin/sh
# Installs Baton.app and links the `baton` command:
#   curl -fsSL https://lmcjt37.github.io/baton-releases/install.sh | sh
# Options: --force replaces an installed Baton. Env: BATON_VERSION (default: latest), BATON_APP_DIR, BATON_BIN_DIR.
set -eu

RELEASES_URL="${BATON_RELEASES_URL:-https://github.com/lmcjt37/baton-releases/releases}"
LICENSE_URL='https://github.com/lmcjt37/baton-releases/blob/main/LICENSE'
BUNDLE_ID='dev.lmcjt37.baton'

say() { printf '%s\n' "$*"; }
step() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
die() { printf '\033[31mError:\033[0m %s\n' "$*" >&2; exit 1; }

writable_dir() { [ -d "$1" ] && [ -w "$1" ]; }

on_path() {
  case ":$PATH:" in *":$1:"*) return 0 ;; *) return 1 ;; esac
}

# A `baton` linked into an app bundle (Homebrew or this script), or the launcher Baton.app's menu writes.
ours() {
  if [ -L "$1" ]; then
    case "$(readlink "$1")" in *.app/Contents/Resources/bin/baton) return 0 ;; *) return 1 ;; esac
  fi
  grep -q '# Installed by Baton.app' "$1" 2> /dev/null
}

# Runs a command as root only when the target isn't writable; sudo reads the password from the terminal, not the pipe.
as_needed() {
  dir=$1
  shift
  if writable_dir "$dir"; then "$@"; else sudo "$@" < /dev/tty; fi
}

main() {
  force=0
  for arg in "$@"; do
    case "$arg" in
      --force) force=1 ;;
      *) die "Unknown option: $arg" ;;
    esac
  done

  [ "$(uname -s)" = Darwin ] || die 'Baton runs on macOS only.'

  app_dir="${BATON_APP_DIR:-}"
  if [ -z "$app_dir" ]; then
    if [ -d "$HOME/Applications/Baton.app" ]; then app_dir="$HOME/Applications"
    elif writable_dir /Applications; then app_dir=/Applications
    else app_dir="$HOME/Applications"
    fi
  fi
  app="$app_dir/Baton.app"

  if [ -e "$app" ] && [ "$force" -eq 0 ]; then
    say "Baton is already installed at $app and updates itself."
    say 'Run again with --force to reinstall:  curl -fsSL https://lmcjt37.github.io/baton-releases/install.sh | sh -s -- --force'
    exit 0
  fi

  tmp=$(mktemp -d)
  trap 'rm -rf "$tmp"' EXIT

  version="${BATON_VERSION:-}"
  if [ -z "$version" ]; then
    step 'Finding the latest release'
    curl -fsSL "$RELEASES_URL/latest/download/feed.json" -o "$tmp/feed.json" || die 'Could not download the release feed.'
    version=$(sed -n 's/.*"currentRelease": *"\([^"]*\)".*/\1/p' "$tmp/feed.json" | head -n 1)
    [ -n "$version" ] || die 'Could not read the version from the release feed.'
  fi
  version=${version#v}
  zip="Baton-$version-universal.zip"

  step "Downloading Baton $version"
  curl -fL --progress-bar "$RELEASES_URL/download/v$version/$zip" -o "$tmp/$zip" || die "Could not download $zip."
  curl -fsSL "$RELEASES_URL/download/v$version/SHA256SUMS" -o "$tmp/SHA256SUMS" || die 'Could not download SHA256SUMS.'

  step 'Verifying'
  grep "  $zip\$" "$tmp/SHA256SUMS" > "$tmp/expected" || die "SHA256SUMS has no entry for $zip."
  (cd "$tmp" && shasum -a 256 -c expected > /dev/null) || die "$zip doesn't match its checksum."
  ditto -x -k "$tmp/$zip" "$tmp/unpacked"
  [ -d "$tmp/unpacked/Baton.app" ] || die "$zip doesn't contain Baton.app."
  codesign --verify --deep --strict "$tmp/unpacked/Baton.app" 2> /dev/null || die 'Baton.app failed its code signature check.'

  step "Installing to $app"
  if [ -e "$app" ] && osascript -e "application id \"$BUNDLE_ID\" is running" 2> /dev/null | grep -q true; then
    osascript -e "tell application id \"$BUNDLE_ID\" to quit" > /dev/null 2>&1 || true
    sleep 2
  fi
  mkdir -p "$app_dir" 2> /dev/null || as_needed "$(dirname "$app_dir")" mkdir -p "$app_dir"
  as_needed "$app_dir" rm -rf "$app"
  as_needed "$app_dir" ditto "$tmp/unpacked/Baton.app" "$app"

  bin_dir="${BATON_BIN_DIR:-}"
  if [ -z "$bin_dir" ]; then
    for candidate in /opt/homebrew/bin /usr/local/bin; do
      if writable_dir "$candidate" && on_path "$candidate"; then bin_dir=$candidate; break; fi
    done
    [ -n "$bin_dir" ] || bin_dir=/usr/local/bin
  fi
  link="$bin_dir/baton"
  if [ -e "$link" ] && ! ours "$link"; then
    say "$link exists and wasn't installed by Baton; leaving it. Link it yourself with:"
    say "  ln -sf \"$app/Contents/Resources/bin/baton\" \"$link\""
  else
    step "Linking $link"
    [ -d "$bin_dir" ] || as_needed "$(dirname "$bin_dir")" mkdir -p "$bin_dir"
    as_needed "$bin_dir" ln -sf "$app/Contents/Resources/bin/baton" "$link"
    on_path "$bin_dir" || say "Add $bin_dir to your PATH to use baton."
  fi

  say ''
  say "✓ Baton $version is installed. It lives in the menu bar and updates itself."
  say "  By installing it you agree to its licence: $LICENSE_URL"
  say ''
  say 'Next, from your React Native project:'
  say '  baton init'
  say '  baton perform'
  say ''
  say 'For agents:  claude mcp add --scope user baton -- baton mcp'
}

# Everything runs from main, so a download cut short by the network can't run half a script.
main "$@"
