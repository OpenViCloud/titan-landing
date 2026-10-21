"""Probe a running site: the checks only a served image can answer
(docs/features/public-site/user-stories.md#us-site-02 AC-1, AC-2, AC-4, AC-6; docs/features/cli/user-stories.md#us-cli-14).

Usage: python3 probe.py <base-url>   e.g. http://localhost:8080, https://site-staging.openvicloud.com
Prints one line per check and a final PROBE_RESULT=PASS|FAIL line; exit code 1 on any failure.
"""
import sys
import urllib.error
import urllib.request


# Headers stay an HTTPMessage: its get() ignores case. Cloudflare answers with lower-case names over HTTP/2, so a
# plain dict would miss "x-robots-tag" and report a header that is there as absent.
def fetch_bytes(url):
    request = urllib.request.Request(url, headers={"User-Agent": "titan-site-probe"})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return response.status, response.headers, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.headers, error.read()


def fetch(url):
    status, headers, body = fetch_bytes(url)
    return status, headers, body.decode("utf-8", "replace")


# The CLI is not served by the site: the install script and the CLI guide take it from the latest release of
# OpenViCloud/cli (docs/features/cli/design.md#cli-download).
CLI_RELEASE = "https://github.com/OpenViCloud/cli/releases/latest/download"


def cli_download_checks(base):
    status, _, _ = fetch_bytes(base + "/downloads/cli/SHA256SUMS")
    return [("site serves no CLI download", status == 404, f"/downloads/cli/SHA256SUMS status={status}")]


def install_script_checks(base):
    # The same script on every site: it names the CLI's release, not the site it came from
    # (docs/features/cli/design.md#install-script).
    status, headers, script = fetch(base + "/install.sh")
    results = [("install.sh 200", status == 200, f"status={status}")]
    expected = f"release='{CLI_RELEASE}'"
    results.append(("install.sh downloads from the CLI release", expected in script, f"{expected} present={expected in script}"))
    results.append(("install.sh not cached", headers.get("Cache-Control") == "no-cache", f"Cache-Control={headers.get('Cache-Control')}"))
    results.append(("install.sh noindex header", headers.get("X-Robots-Tag") == "noindex", f"X-Robots-Tag={headers.get('X-Robots-Tag')}"))
    return results


def main():
    base = sys.argv[1].rstrip("/")
    results = []

    status, headers, home = fetch(base + "/")
    results.append(("home 200", status == 200, f"status={status}"))
    is_landing = "OpenViCloud" in home and 'id="pricing"' in home and '<html lang="en"' in home
    results.append(("home is the English landing", is_landing, f"title, pricing anchor and lang=en present={is_landing}"))
    results.append(("home noindex header", headers.get("X-Robots-Tag") == "noindex", f"X-Robots-Tag={headers.get('X-Robots-Tag')}"))

    status, headers, docs = fetch(base + "/docs/")
    results.append(("docs 200", status == 200, f"status={status}"))
    results.append(("docs noindex header", headers.get("X-Robots-Tag") == "noindex", f"X-Robots-Tag={headers.get('X-Robots-Tag')}"))

    status, headers, home_vi = fetch(base + "/vi/")
    is_landing_vi = 'id="pricing"' in home_vi and '<html lang="vi"' in home_vi
    results.append(("Vietnamese landing 200", status == 200 and is_landing_vi, f"status={status} pricing anchor and lang=vi present={is_landing_vi}"))

    status, headers, docs_vi = fetch(base + "/vi/docs/")
    results.append(("Vietnamese docs 200", status == 200 and 'lang="vi"' in docs_vi, f"status={status}"))

    status, headers, missing = fetch(base + "/missing-page-" + "x" * 8)
    results.append(("missing page 404", status == 404, f"status={status}"))
    landing_anchor = 'id="pricing"' in missing
    results.append(("missing page is not the landing", not landing_anchor, f"landing pricing anchor present={landing_anchor}"))
    results.append(("404 noindex header", headers.get("X-Robots-Tag") == "noindex", f"X-Robots-Tag={headers.get('X-Robots-Tag')}"))
    results.append(("404 not cached", headers.get("Cache-Control") == "no-cache", f"Cache-Control={headers.get('Cache-Control')}"))

    status, _, robots = fetch(base + "/robots.txt")
    results.append(("robots disallows all", status == 200 and "Disallow: /" in robots, f"status={status}"))

    status, headers, config = fetch(base + "/config.json")
    results.append(("config.json served", status == 200 and "apiBaseUrl" in config, f"status={status}"))
    results.append(("config.json not cached", headers.get("Cache-Control") == "no-store", f"Cache-Control={headers.get('Cache-Control')}"))

    results.extend(cli_download_checks(base))
    results.extend(install_script_checks(base))

    failed = 0
    for name, ok, detail in results:
        print(f"{'PASS' if ok else 'FAIL'}  {name}  ({detail})")
        if not ok:
            failed += 1
    print(f"PROBE_RESULT={'PASS' if failed == 0 else 'FAIL'} checks={len(results)} failed={failed}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
