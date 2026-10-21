# Design direction, 21 October 2026

## Brief

Latent Watermarking 101 is a technical reading companion for applied AI students. Its job is to make the location, recovery and evidence of an invisible mark understandable. Existing studies and runnable exercises remain authoritative content. Keep React, TypeScript, Vite, hash routes and the GitHub Pages base path. Continue on `handbook-overhaul`. Remove the public Threats and gaps navigation item. Expand the glossary into a searchable technical reference. No invented credentials, imagery or results.

## Concepts considered

Scores are originality / fit / feasibility / portability, each 1 to 5; lower portability is better.

| Territory | Idea and anchor | Signature | Feeling and screenshot | Scores |
|---|---|---|---|---|
| Material: latent samples | A readable signal is concealed in an apparently unstructured field. Initial-noise watermarking changes latent coordinates. | Reveal and edit an eight-bit sign pattern in a deterministic noise field. | Curious, precise; large signal/noise headline beside a marked coordinate field. | 5 / 5 / 5 / 1 |
| Process: evidence tracing | Read every method backwards from its detector evidence to the inserted information. Inversion is central to many studies. | A reversible pipeline that traces image, latent and message. | Investigative; a reverse trajectory connecting a paper to its assumptions. | 4 / 5 / 4 / 2 |
| Formal: reference margins | A research reference built around an aligned outer margin and cross-referenced terms. The reader repeatedly moves between papers and definitions. | A term expands into its linked reading trail. | Orderly; a compact reference spread with large headings and margin notes. | 3 / 4 / 5 / 3 |

Selected the latent-sample concept because it gives the subject a concrete, computed interaction and also explains the design's restraint. Use reference margins as a supporting reading convention, not a second effect.

## Concept card

Idea: Discover the information inside apparently random noise.
Metaphor: A latent sample examined through its known coordinate key.
Signature: An editable eight-bit sign code and a reveal control; its field, count and recovered bits derive from the same state.
Emotion: Immediate clarity about the subject, then curiosity about the hidden signal.
Motion verb: Reveal and align.
Screenshot: Large left-aligned title, quiet cyan coordinate field, exact recovered bits.

This is an explicitly simplified sign exercise. It does not simulate diffusion, cryptographic secrecy, robustness or a paper method. The field is synthetic and deterministic. Recovery reads the selected coordinates directly.

## System

- Ground `#101213`: neutral charcoal, like the dark surround of a sample visualisation.
- Ink `#f0f2ed`: pale text.
- Muted `#a5adae`: secondary readable labels.
- Line `#343b3d`: separators and controls.
- Accent `#9be2e3`: cyan reserved for selected coordinates, links and active navigation.
- Surface/curtain `#1b2224`: elevated sample and worked-example surfaces.

IBM Plex Sans is retained for reading and display; IBM Plex Mono is retained for code, coordinates and measured bits. Both are self-hosted from installed Fontsource packages. Display type has tight tracking, fluid 44 to 88 px sizing and deliberate line breaks. Reading remains 18 px, around 65 characters, with 1.6 leading. UI labels are 12 to 14 px. The difference between title, prose and data supplies the visual hierarchy.

Desktop grid: a 236 px chapter rail, flexible content with 48 px gutters, and a local contents column on large screens. The home page and indexes use a wider composition; studies keep a controlled measure. Mobile: compact sticky masthead, drawer navigation, a stacked sample figure, full-width reading and controls. Radius rule: 6 px for controls and bounded figures; articles remain open compositions.

Use one easing family: power3.out, 220 ms for small controls and 280 ms for subsequent page entrances. GSAP is loaded for subsequent navigation, owns page-level motion and reverts on navigation; the first frame is complete and still; Lenis is installed but native scrolling is deliberately retained for long technical references and section navigation. No loader, WebGL, pointer follower or pinned section. Still at rest is intentional: readers need to inspect sample positions and long equations. The reveal and responsive controls carry the interaction. Reduced motion shows the complete static layout and all feedback without movement.

## Composition plan

Home: asymmetric poster and sample

```text
section label                 field label + key
signal / noise title          deterministic sample grid
purpose + two actions         editable bits + reveal
33 studies   24 exercises     computed extraction
```

Reading route: sequential horizontal index, stacking on phone

```text
How to use this handbook
Foundation -> method -> evidence
short purpose under each step
```

Selected studies: open reference rows

```text
Read the mechanisms                 all studies link
method name     insertion location     study link
method name     insertion location     study link
```

Glossary: searchable reference spread

```text
Glossary title + count
search field       topic selection
alphabet/topic navigation
term       definition / significance / example
           related terms / relevant reading
```

Study: article and reference margins

```text
breadcrumb / kind
study title and description         local contents
insertion / training / family
prose -> equation -> worked example -> evidence
```

404: missing reference

```text
404 / Reference not found
route explanation
return home / search papers
```

## Genericness test

A generic technology landing page would use glowing gradients, arbitrary floating particles and three repeated cards. This design uses an exact selectable latent sign field, paper insertion labels and a real reference index. Removed generic repeated eyebrow labels on the home page and avoided an animated background that competes with reading. No raster illustration is needed: the subject is a mathematical transformation, so native SVG and real text convey it accurately.

## Delivery and QA

Run production QA and obtain fresh evidence-only criticism after design revisions. Explicit hash routes are used because the skill's generic crawler does not discover SPA hash navigation. Report measured accessibility/performance and the static-hosting metadata limits honestly. No award claim or fabricated score. The existing source and CPU evidence registers remain unchanged by the visual redesign.

## Final restraint pass

Removed the sidebar slogan because it repeated the reading purpose without helping navigation. Added a source-derived insertion trace to method pages only where the registry names an explicit pipeline stage. It carries the signal concept into the reading experience without assigning an ambiguous location to other methods.

## Performance refinement

The chapter rail and home page use a generated metadata view of the same typed handbook registry. Full studies, revision material, equations and labs are loaded at their routes. The generator runs before development, tests and production builds, and an equality test checks its output against the canonical records. This is derived navigation metadata, not a second content catalogue.

The glossary renders 24 terms per page and off-screen definitions defer layout and paint. Search still covers every term; alphabet jumps and deep links choose the destination's page before focusing and scrolling. The sample field batches unchanged coordinates into SVG paths while its selected coordinates remain individually labelled. Phone introductions were shortened so reference controls appear sooner. The LAW worked example adds a computed radius/variance comparison with the original approximation and its assumptions. Local contents clear during route changes and rebuild after the new article has mounted.

The evidence-only review caught missing word spaces when tablet styles hid heading line breaks. Literal spaces now preserve the title in both visual and extracted text. The tablet sample reserves room for all eight message controls. Below the wide-screen contents breakpoint, studies expose their existing section links through a native disclosure. Equations which exceed their reading width display a pan cue and become named keyboard-scroll regions; short equations remain ordinary mathematical content.
