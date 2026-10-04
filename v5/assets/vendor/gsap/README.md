# GSAP, self-hosted

`gsap.min.js` and `Flip.min.js` are GSAP 3.15.0, unmodified, from the npm
package `gsap@3.15.0` (`dist/`). Each keeps its licence header: GreenSock's
standard "no charge" licence, https://gsap.com/standard-license. This edition
serves its own copy, so no request leaves the site.

Used by `../../js/flip.js` for one thing: Work's grid reflowing when a filter
is chosen. It loads only on a page with a grid to filter, once the page is idle.

| File | SHA-256 |
| --- | --- |
| `gsap.min.js` | `92bb9a96476f983d212a2bc4f54c889039c1696dd4461d40a736860938570fbb` |
| `Flip.min.js` | `cbe3ca726350f8d230da38a14ce2384e7772e05a45cee6144dd7fe6dde868c2f` |

To update: `npm pack gsap@<version>`, copy the two files from `package/dist/`,
and update the version and checksums here and in `../../js/flip.js`.
