### pixi-layout-engine by [@lukasz-okuniewicz](http://github.com/lukasz-okuniewicz)

# Layout Controller

A flexible, high-performance layout utility for arranging display objects (e.g., PIXI.js components) inside a container. It provides 25+ layout strategies including horizontal, vertical, circle, grid, and various creative and data-driven patterns. Perfect for game development, data visualization, UI design, and any application requiring dynamic object arrangement.

---

### Support My Work
If you find **pixi-layout-engine** useful and would like to support my work, you can buy me a coffee. Your contributions help me dedicate more time to improving this library and creating new features for the community. Thank you for your support! ☕💖

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support%20My%20Work-orange?logo=buy-me-a-coffee&logoColor=white)](https://buymeacoffee.com/lukasz.okuniewicz)

---

## 🎮 Demo
Try it out here: [pixi-layout-engine Live Editor](https://lukasz-okuniewicz.github.io/pixi-layout-engine-ui/)

The live editor allows you to experiment with all layouts in real-time, adjust parameters, and see immediate visual feedback.

---

## 📦 Installation

### npm
```bash
npm i pixi-layout-engine
```

### yarn
```bash
yarn add pixi-layout-engine
```

### pnpm
```bash
pnpm add pixi-layout-engine
```

### Import
```js
import { applyLayout, layoutEnum } from "pixi-layout-engine";
```

### TypeScript Support
The library is written in TypeScript and includes full type definitions. No additional `@types` package needed.

```ts
import { applyLayout, layoutEnum, type LayoutOptions, type LayoutComponent } from "pixi-layout-engine";
```

---

## 🚀 Quick Start

### Basic Usage

```js
import * as PIXI from 'pixi.js';
import { applyLayout, layoutEnum } from "pixi-layout-engine";

// 1. Create a PIXI.Container
const container = new PIXI.Container();

// 2. Create your display objects (sprites, graphics, etc.)
const sprite1 = new PIXI.Sprite(PIXI.Texture.WHITE);
const sprite2 = new PIXI.Sprite(PIXI.Texture.WHITE);
const sprite3 = new PIXI.Sprite(PIXI.Texture.WHITE);

// 3. Add the objects as children of the container
container.addChild(sprite1, sprite2, sprite3);

// 4. Apply a layout directly to the container
applyLayout(container, {
  layoutName: layoutEnum.CIRCLE,
  radius: 150,
  rotateToCenter: true,
});
```

### TypeScript Example

```ts
import * as PIXI from 'pixi.js';
import { applyLayout, layoutEnum, type LayoutOptions } from "pixi-layout-engine";

const container = new PIXI.Container();
const sprites: PIXI.Sprite[] = [];

// Create multiple sprites
for (let i = 0; i < 10; i++) {
  const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  sprite.width = 50;
  sprite.height = 50;
  sprites.push(sprite);
  container.addChild(sprite);
}

// Configure layout with TypeScript types
const options: LayoutOptions = {
  layoutName: layoutEnum.SQUARE,
  columns: 4,
  spacing: 20,
  flowDirection: "snake",
};

applyLayout(container, options);
```

---

## 📱 Responsive Layouts

You can easily define different layout options for `portrait` and `landscape` orientations. The engine will automatically merge the correct configuration for you.

This is handled by three new properties in the options object:

-   `orientation` (`"portrait"` | `"landscape"`) – The current device orientation. This tells the layout engine which set of overrides to apply.
-   `portrait` (object) – An object containing any layout options that should **override** the base settings when `orientation` is `"portrait"`.
-   `landscape` (object) – An object containing any layout options that should **override** the base settings when `orientation` is `"landscape"`.

### Responsive Usage Example

```js
import { applyLayout, layoutEnum } from "pixi-layout-engine";

// 1. Define a single layout object with responsive overrides
const responsiveGridLayout = {
  // Base options shared by both orientations
  layoutName: layoutEnum.SQUARE,
  spacing: 15,

  // Options for portrait mode
  portrait: {
    columns: 4,
    flowDirection: "default",
  },

  // Options for landscape mode
  landscape: {
    columns: 8,
    flowDirection: "snake",
  },
};

// 2. In your application logic, detect the current orientation
function updateLayout() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const currentOrientation = isPortrait ? 'portrait' : 'landscape';

  // 3. Apply the layout, passing the current orientation
  applyLayout(container, {
    ...responsiveGridLayout,
    orientation: currentOrientation,
  });
}

// Call it on load and on resize
window.addEventListener('resize', updateLayout);
updateLayout(); // Initial call
```

### Advanced Responsive Pattern

```js
// Responsive layout with different layouts per orientation
const responsiveConfig = {
  // Base layout (used as fallback)
  layoutName: layoutEnum.SQUARE,
  columns: 5,
  spacing: 10,
  
  portrait: {
    layoutName: layoutEnum.CIRCLE,
    radius: 200,
    autoRadius: true,
  },
  
  landscape: {
    layoutName: layoutEnum.SQUARE,
    columns: 8,
    spacing: 15,
    flowDirection: "spiral-out",
  },
};

function handleResize() {
  const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  applyLayout(container, { ...responsiveConfig, orientation });
}
```

---

## 🗂️ Layout Types

### Basic Layouts

#### LINE
Universal layout for arranging items in a single, non-wrapping line at any angle (horizontal, vertical, or diagonal).

**Use Cases:**
- Menu bars
- Toolbars
- Linear progress indicators
- Diagonal arrangements

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.LINE,
  angle: 45, // Diagonal line
  spacing: 30,
  alignItems: "center",
});
```

#### STACK
Creates a pile of overlapping items, like a deck of cards or chips.

**Use Cases:**
- Card game discard piles
- Chip stacks in casino games
- Overlapping UI elements
- Layered visual effects

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.STACK,
  offsetX: 2,
  offsetY: 2,
  offsetRotation: 5, // Slight rotation for natural look
});
```

---

### Grid Layouts

#### SQUARE
An extremely versatile grid with dozens of flowDirection patterns for arranging items, plus an optional mode for item spanning (colSpan/rowSpan).

**Use Cases:**
- Inventory grids
- Game boards
- Photo galleries
- Dashboard widgets
- Card collections

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.SQUARE,
  columns: 6,
  spacing: 10,
  flowDirection: "spiral-out", // Start from center
  alignItems: "center",
  justifyItems: "center",
});
```

#### PAYOUT_ZONES
Places components into predefined rectangular areas on a game board.

**Use Cases:**
- Casino game tables
- Board games
- Zone-based UIs
- Multi-region layouts

**Example:**
```js
const zones = [
  { name: 'main', bounds: { x: 0, y: 0, width: 400, height: 300 } },
  { name: 'side', bounds: { x: 420, y: 0, width: 200, height: 150 } },
];

// Assign zoneName to components
chip1.zoneName = 'main';
chip2.zoneName = 'side';

applyLayout(container, {
  layoutName: layoutEnum.PAYOUT_ZONES,
  zones: zones,
  zoneLayout: layoutEnum.BUBBLE, // Layout within each zone
});
```

#### PYRAMID
Arranges items in centered, tiered rows, perfect for prize tables. Can be oriented vertically or horizontally.

**Use Cases:**
- Prize tables
- Leaderboards
- Tiered displays
- Hierarchical visualizations

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.PYRAMID,
  tiers: [1, 3, 5, 7], // Items per tier
  direction: "up",
  rowGap: 20,
  itemSpacing: 15,
});
```

#### FLEX_WRAP
Arranges items in rows, wrapping when maxWidth is exceeded.

**Use Cases:**
- Responsive grids
- Tag clouds
- Flexible toolbars
- Adaptive layouts

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.FLEX_WRAP,
  maxWidth: 800,
  spacing: 15,
  justifyContent: "space-between",
  alignContent: "center",
});
```

#### MASONRY
Pinterest-style layout where items are packed in columns of variable height.

**Use Cases:**
- Image galleries
- Pinterest-style boards
- Card layouts
- Variable-height grids

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.MASONRY,
  columns: 4,
  spacing: 10,
});
```

#### PERIMETER_GRID
Arranges components along the outer edge of a rectangular grid, with extensive customization.

**Use Cases:**
- Border decorations
- Perimeter-based UIs
- Frame layouts
- Edge arrangements

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.PERIMETER_GRID,
  columns: 10,
  rows: 8,
  startCorner: "top-left",
  direction: "clockwise",
  distribution: "even",
  prioritizeCorners: true,
});
```

#### ISOMETRIC
Arranges items on a 2.5D isometric grid.

**Use Cases:**
- Isometric games
- 2.5D visualizations
- Tile-based games
- Isometric UIs

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.ISOMETRIC,
  tileWidth: 64,
  tileHeight: 32,
  columns: 8,
  spacing: 0,
});
```

---

### Creative & Algorithmic Layouts

#### CIRCLE
Distributes components in a circular, arc, spiral, or donut pattern. Supports data-driven distribution, sorting, and organic "jitter" effects.

**Use Cases:**
- Character select screens
- Radial menus
- Circular progress indicators
- Data visualizations
- Game UI elements

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.CIRCLE,
  radius: 200,
  autoRadius: true,
  spacing: 10,
  rotateToCenter: true,
  startAngle: 0,
  endAngle: 360,
});
```

#### CARD_HAND
Arranges components in a fanned-out arc, like a hand of cards.

**Use Cases:**
- Card games
- Hand displays
- Fan animations
- Arc arrangements

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.CARD_HAND,
  arcRadius: 400,
  arcAngle: 45, // Wider fan = larger angle
});
```

#### SPREAD_EXPLOSION
Scatters items outwards in a semi-random burst, like a loot drop.

**Use Cases:**
- Loot drops
- Explosion effects
- Scatter animations
- Random distributions

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.SPREAD_EXPLOSION,
  maxRadius: 300,
  spreadFactor: 2.5,
  randomness: 0.7, // 0 = perfect spiral, 1 = completely random
});
```

#### SPIRAL
Arranges components in an Archimedean spiral from the center outwards.

**Use Cases:**
- Spiral galleries
- Artistic arrangements
- Progressive reveals
- Spiral patterns

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.SPIRAL,
  separation: 30,
  tightness: 0.8,
});
```

#### PHYLLOTAXIS
Arranges items in a spiral pattern inspired by sunflower seeds.

**Use Cases:**
- Natural patterns
- Organic layouts
- Artistic visualizations
- Nature-inspired UIs

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.PHYLLOTAXIS,
  radius: 200,
  spacing: 5,
});
```

#### WAVE
Places components along a sine wave.

**Use Cases:**
- Wave animations
- Flowing arrangements
- Dynamic layouts
- Animated patterns

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.WAVE,
  amplitude: 50,
  frequency: 0.02,
  spacing: 30,
});
```

#### PATH
Distributes items along a specified SVG path. (Requires a path parser)

**Use Cases:**
- Custom curves
- Complex paths
- SVG-based layouts
- Artistic arrangements

**Example:**
```js
import { Properties } from 'svg-path-properties';

applyLayout(container, {
  layoutName: layoutEnum.PATH,
  path: 'M 0 0 Q 100 200 200 0',
  pathParser: Properties,
  rotateToPath: true,
});
```

#### PERSPECTIVE
Creates a 3D depth effect by scaling items towards a vanishing point.

**Use Cases:**
- 3D depth effects
- Perspective views
- Depth illusions
- 3D-like UIs

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.PERSPECTIVE,
  vanishingPoint: { x: 400, y: 300 },
  depthSpacing: 0.85,
  scale: 0.5,
});
```

#### ORBIT
Arranges components on concentric circular orbits (rings), like a solar system. Items are distributed round-robin across orbits.

**Use Cases:**
- Character select screens
- Orbital menus
- Multi-ring displays
- Solar system visualizations

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.ORBIT,
  orbitCount: 3,
  orbitSpacing: 80,
  radius: 100,
  orbitPhase: 30, // Stagger each orbit
  rotateToCenter: true,
});
```

#### DNA
Arranges components in a double-helix pattern with two intertwining strands, perfect for scientific or futuristic UIs.

**Use Cases:**
- Scientific visualizations
- Futuristic UIs
- Helix patterns
- Double-strand displays

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.DNA,
  radius: 100,
  dnaPitch: 60,
  dnaTwist: 60,
  rotateToCenter: true,
});
```

#### REEL_SPINNER
Arranges components as if wrapped around a rotating cylinder (slot machine reel), with perspective scaling and rotation support.

**Use Cases:**
- Slot machines
- Reel animations
- 3D cylinder effects
- Rotating displays

**Example:**
```js
applyLayout(container, {
  layoutName: layoutEnum.REEL_SPINNER,
  spinDegrees: 0, // Animate this value for spinning
  radius: 250,
  itemAngleStep: 30,
  depthScale: 0.5,
  vertical: true,
});
```

---

### Data-Driven Layouts

#### TREEMAP
Space-filling layout where item size is proportional to its value.

**Use Cases:**
- Data visualization
- Hierarchical data
- Size-based layouts
- Proportional displays

**Example:**
```js
// Assign values to components
items.forEach((item, i) => {
  item.value = data[i].value;
});

applyLayout(container, {
  layoutName: layoutEnum.TREEMAP,
  width: 800,
  height: 600,
});
```

#### BUBBLE
Tightly packs items (as circles) using a physics-based simulation.

**Use Cases:**
- Bubble charts
- Packed circles
- Physics-based layouts
- Organic arrangements

**Example:**
```js
items.forEach(item => { item.value = Math.random() * 100; });

applyLayout(container, {
  layoutName: layoutEnum.BUBBLE,
  width: 800,
  height: 600,
  iterations: 300,
  centerStrength: 0.002,
});
```

#### CIRCLE_PACK
Packs items (as circles) into a containing circle, great for proportions.

**Use Cases:**
- Proportional circles
- Nested visualizations
- Hierarchical packing
- Circle-based charts

**Example:**
```js
items.forEach(item => { item.value = Math.random() * 50 + 10; });

applyLayout(container, {
  layoutName: layoutEnum.CIRCLE_PACK,
  boundsRadius: 300,
  padding: 5,
  iterations: 200,
});
```

#### VORONOI
Partitions the space into cells around each component. (Requires a parser)

**Use Cases:**
- Voronoi diagrams
- Space partitioning
- Scientific visualizations
- Geometric patterns

**Example:**
```js
import { Delaunay } from 'd3-delaunay';

applyLayout(container, {
  layoutName: layoutEnum.VORONOI,
  width: 800,
  height: 600,
  voronoiParser: Delaunay,
});
```

#### WORD_CLOUD
Arranges items like a word cloud, with larger items near the center.

**Use Cases:**
- Word clouds
- Tag clouds
- Size-based arrangements
- Text visualizations

**Example:**
```js
items.forEach(item => { item.value = Math.random() * 100; });

applyLayout(container, {
  layoutName: layoutEnum.WORD_CLOUD,
  width: 800,
  height: 600,
  iterations: 200,
  spiralTightness: 1.3,
});
```

---

## ⚙️ Options Reference

### Component-Specific Properties

Some layouts respond to properties set on the individual `LayoutComponent` objects themselves. These properties should be set directly on the component before calling `applyLayout`.

#### `value` (number)
Used by all **Data-Driven Layouts** (like `BUBBLE`, `TREEMAP`, `CIRCLE_PACK`, `WORD_CLOUD`) and by the `SQUARE` grid's `value-weighted-*` flow directions to determine size or sort order.

```js
sprite1.value = 50;
sprite2.value = 100;
sprite3.value = 25;
```

#### `group` (string)
For the `SQUARE` grid's `clustered-fill` flow, specifies which visual group an item belongs to. Items with the same group will be placed together.

```js
sprite1.group = 'category-a';
sprite2.group = 'category-a';
sprite3.group = 'category-b';
```

#### `colSpan` (number)
For the `SQUARE` grid (in `useGridSpanning` mode), specifies how many columns an item should occupy. Must be a positive integer.

```js
sprite1.colSpan = 2; // Takes up 2 columns
sprite2.colSpan = 1; // Takes up 1 column
```

#### `rowSpan` (number)
For the `SQUARE` grid (in `useGridSpanning` mode), specifies how many rows an item should occupy. Must be a positive integer.

```js
sprite1.rowSpan = 2; // Takes up 2 rows
sprite2.rowSpan = 1; // Takes up 1 row
```

#### `zoneName` (string)
For the `PAYOUT_ZONES` layout, specifies which named zone an item belongs to. Must match a zone name in the `zones` array.

```js
chip1.zoneName = 'main_bet';
chip2.zoneName = 'side_bet_1';
```

---

### General Options

These options are used by many different layouts and provide common functionality.

#### `spacing` (number)
Gap between components in pixels. Default: `0`.

```js
{ spacing: 20 } // 20 pixels between items
```

#### `sizingMode` (`"auto"` | `"fixed"`)
Determines whether child sizes are auto-detected or fixed.

- `"auto"` (default): Uses the actual width/height of each component
- `"fixed"`: Uses `fixedWidth` and `fixedHeight` for all components

```js
{ sizingMode: "auto" } // Use actual component sizes
{ sizingMode: "fixed", fixedWidth: 50, fixedHeight: 50 } // Force all to 50x50
```

#### `fixedWidth`, `fixedHeight` (number)
Used with `"fixed"` sizing mode to enforce uniform dimensions for all components.

```js
{
  sizingMode: "fixed",
  fixedWidth: 64,
  fixedHeight: 64
}
```

---

### Grid-like Layouts Options

#### `columns` (number)
The number of columns in the grid. Required for most grid layouts.

```js
{ columns: 6 } // 6-column grid
```

#### `rows` (number)
The number of rows. Used by `PERIMETER_GRID` and some other layouts.

```js
{ rows: 4 } // 4-row grid
```

#### `columnGap` (number)
Horizontal gap between columns in pixels. Defaults to `spacing` if not specified.

```js
{ columnGap: 15 } // 15px between columns
```

#### `rowGap` (number)
Vertical gap between rows in pixels. Defaults to `spacing` if not specified.

```js
{ rowGap: 20 } // 20px between rows
```

#### `alignItems` (`"start"` | `"center"` | `"end"`)
Vertical alignment of items within their grid cell or container.

```js
{ alignItems: "center" } // Vertically center items
```

#### `justifyItems` (`"start"` | `"center"` | `"end"`)
Horizontal alignment of items within their grid cell or container.

```js
{ justifyItems: "center" } // Horizontally center items
```

---

### Specific Layout Options

#### Line Layout
- `angle` (number) – The angle of the line in degrees. 0 is horizontal, 90 is vertical.
- `spacing` (number) – The gap between items along the line.
- `isReversed` (boolean) – Reverses the order of components along the line.
- `alignItems` (`"start"` | `"center"` | `"end"`) – Cross-axis alignment of items relative to the line's angle.

#### Stack Layout
- `offsetX`, `offsetY` (number) – The horizontal and vertical pixel offset for each subsequent item in the stack.
- `offsetRotation` (number) – The incremental rotation in degrees for each item, creating a more natural, messy look.

#### Payout Zones Layout
- `zones` (`{ name: string, bounds: { x, y, width, height } }[]`) – An array of named rectangular zones that define the layout areas.
- `zoneLayout` (string) – The `layoutName` of another simple layout (e.g., `SQUARE`, `BUBBLE`) to apply to the items *within* each zone. Defaults to random placement.

#### Circle Layout
A flexible circular layout system with support for arcs, spirals, organic effects, and value-based distribution.

**Basic Controls:**
- `radius` (number) – The base distance of each component from the center.
- `innerRadius` (number) – Creates a "hole" in the middle, forming a donut shape.
- `autoRadius` (boolean) – If `true`, calculates the perfect radius to fit all components based on their size.
- `spacing` (number) – The pixel gap between items. Only has an effect when `autoRadius` is `true`.

**Arc & Angle Controls:**
- `startAngle`, `endAngle` (number) – The start and end angles in degrees, allowing for partial arcs.
- `angularSpacing` (number) – A fixed gap in degrees between each component.
- `justifyArc` (`"start"` | `"center"`) – Alignment of items within a partial arc (has no effect on a full 360° circle).

**Distribution & Sorting:**
- `sortBy` (`"value"` | `"name"` | function) – Sorts components before arranging them.
- `sortDirection` (`"asc"` | `"desc"`) – The direction for sorting.
- `distributeByValue` (boolean) – Allocates angular space to each item based on its `.value` property.

**Shape & Form:**
- `spiralFactor` (number) – Increases the radius for each item, transforming the circle into a spiral.
- `rotateToCenter` (boolean) – Rotates each component to face the layout's center point.
- `rotationOffset` (number) – An extra rotation in degrees applied to items when `rotateToCenter` is `true`.

**Organic Effects:**
- `radiusJitter` (number) – Max random pixel offset applied to each item's radius.
- `angleJitter` (number) – Max random degree offset applied to each item's angle.

#### Card Hand Layout
- `arcRadius` (number) – The distance from the central pivot point to the center of each card.
- `arcAngle` (number) – The total angle of the fan. A larger angle creates a wider spread.

#### Circle Pack Layout
- `boundsRadius` (number) – The radius of the invisible outer circle that contains the packed items.
- `padding` (number) – The minimum pixel gap to enforce between each packed circle.
- `iterations` (number) – The number of simulation passes to run for stabilization.
- `centerStrength` (number) – A gravity-like force that pulls all circles towards the center.
- `radiusScale` (number) – A multiplier to adjust the final size of the circles derived from their `value`.

#### Pyramid Layout
- `tiers` (`number[]`) – An array of numbers defining the item count for each row, from top to bottom (e.g., `[1, 2, 3]`).
- `direction` (`"up"` | `"down"` | `"left"` | `"right"`) – The primary direction the pyramid is built in.
- `rowGap` / `itemSpacing` (number) – Gaps between tiers (main axis) and items within a tier (cross axis).
- `alignment` (`"top"` | `"center"` | `"end"`) – The vertical alignment of the entire pyramid structure.
- `tierAlignment` (`"start"` | `"center"` | `"end"`) – The alignment of tiers relative to each other on the cross axis.
- `justifyTierContent` (`"start"` | `"center"` | `"end"` | `"space-between"` | `"space-around"`) – How to distribute items within a tier if useActualSize is true and there is extra space.
- `useActualSize` (boolean) – If true, tiers are sized based on the actual dimensions of their contents rather than a uniform grid.
- `sortBy` (string | function) – Sorts components before arranging them into tiers.
- `sortDirection` (`"asc"` | `"desc"`) – The direction for sorting.
- `staggerOffset` (number) – An additional offset applied to each subsequent tier on the cross-axis.

#### Spread Explosion Layout
- `maxRadius` (number) – The maximum distance any item can be scattered from the center.
- `spreadFactor` (number) – Controls the density of the underlying spiral pattern.
- `randomness` (number) – A value from 0 to 1 that controls the amount of chaos. `0` is a perfect spiral; `1` is completely random.

#### Square/Grid Layout
- `columns` (number) – The number of columns in the grid.
- `useGridSpanning` (boolean) – If true, enables the advanced algorithm that respects `colSpan` and `rowSpan` on components. Most complex flow directions do not apply in this mode.
- `honeycombOrientation` (`"pointy-top"` | `"flat-top"`) – For `flowDirection: 'honeycomb'`, controls whether the hexagons are oriented with a point or a flat side on top. Defaults to `pointy-top`.
- `flowDirection` (string) – Determines the visual pattern used to fill the grid. This is the most powerful option, accepting dozens of values, including:
  - **Standard & Corner-Based:** `default`, `snake`, `column`, `column-snake`, `honeycomb`, `bottom-start`, `right-start`, etc.
  - **Algorithmic:** `spiral-out`, `spiral-in`, `hilbert-curve`, `z-order`, `diagonal-fill`.
  - **Structural & Symmetric:** `perimeter-first`, `interlaced-fill`, `corner-converge`, `diamond-fill`, `block-fill`, `gravity-fill` (fills from a point), `symmetric-outward` (fills from center row).
  - **Artistic & Stochastic:** `random-walk`, `boustrophedon` (snake with flipped sprites), `braid-flow` (weaves between rows).
  - **Data-Driven:** `value-weighted-*` (sorts items by `value` before applying a pattern), `clustered-fill` (groups items by a `group` property).
- `blockWidth`, `blockHeight` (number) - For `flowDirection: 'block-fill'`, configures the size of the blocks (defaults to `2`).
- `braidRows` (number) - For `flowDirection: 'braid-flow'`, configures the number of rows to weave between (defaults to `2`).
- `flowReverse` (boolean) – Reverses the row order from bottom-to-top. This is overridden by corner-start flow directions.
- `lastRowAlign` (`"start"` | `"center"` | `"end"`) – Alignment of the last row if it's not completely filled. Does not apply to most complex or snake flows.

#### Perimeter Grid
- `columns`, `rows` (number) – The dimensions of the grid defining the perimeter.
- `autoRows` (boolean) – If true, automatically calculates the number of rows needed to fit all components on the perimeter based on the column count.
- `startCorner` (`"top-left"` | `"top-right"` | `"bottom-right"` | `"bottom-left"`) – The starting corner for the layout.
- `direction` (`"clockwise"` | `"counter-clockwise"`) – The direction components are placed around the perimeter.
- `distribution` (`"even"` | `"packed"`) – "even" spreads components across the entire perimeter; "packed" places them sequentially from the start.
- `prioritizeCorners` (boolean) – If true, places the first 4 components at the grid corners. Can be combined with cornerSortBy.
- `cornerSortBy` (string | function) - If set, sorts components and places the "highest" or "lowest" values in the corners.
- `sortDirection` (`"asc"` | `"desc"`) - The direction for cornerSortBy.
- `offset` (number) - Pushes components outwards (positive value) or inwards (negative value) from their perimeter position.
- `rotation` (`"none"` | `"face-inward"` | `"face-outward"`) - Automatically rotates components to face towards or away from the grid's center.

#### Flex Wrap Layout
- `maxWidth` (number) – The maximum width of a line before components wrap to the next.
- `maxHeight` (number) – The total container height to align content within.
- `justifyContent` (`"start"` | `"center"` | `"end"` | `"space-between"` | `"space-around"`) – How space is distributed between items on a line.
- `alignContent` (`"start"` | `"center"` | `"end"` | `"space-between"` | `"space-around"` | `"stretch"`) – How rows are distributed vertically if there is extra space in maxHeight.

#### Spiral Layout
- `separation` (number) – Distance between the arms of the spiral.
- `tightness` (number) – Controls how tightly the spiral is wound.

#### Wave Layout
- `amplitude` (number) – The height of the wave's crests and troughs.
- `frequency` (number) – How many waves appear over a given distance; affects the wavelength.

#### Path Layout
- `path` (string) – An SVG path data string (e.g., "M0,0 L100,100").
- `pathParser` (class) – A constructor for an SVG path parsing utility.
- `rotateToPath` (boolean) – If true, rotates components to match the angle of the path.

#### Perspective Layout
- `vanishingPoint` (`{ x: number, y: number }`) – The point on the canvas where lines converge.
- `depthSpacing` (number) – A factor determining how much items shrink with each row. Values `< 1` recede, values `> 1` come forward.
- `scale` (number) – An overall scale factor to shrink or enlarge the entire projection. Defaults to `0.5`.

#### Isometric Layout
- `tileWidth`, `tileHeight` (number) – The screen dimensions of a single isometric tile.

#### Orbit Layout
- `orbitCount` (number) – The number of concentric orbits (rings). Defaults to `3`.
- `orbitSpacing` (number) – The radial distance between orbits. Defaults to `spacing + 20`.
- `orbitPhase` (number) – Angular offset in degrees added per orbit for stagger effect.
- `radius` (number) – The base radius of the innermost orbit.
- `startAngle` (number) – The starting angle in degrees for the first orbit.
- `rotateToCenter` (boolean) – Rotates each component to face the layout's center point.
- `rotationOffset` (number) – Extra rotation in degrees applied when `rotateToCenter` is `true`.

#### DNA Layout
- `radius` (number) – The horizontal distance of each strand from the center. Defaults to `100`.
- `dnaPitch` (number) – Vertical distance between rungs (pairs of items). Defaults to `60`.
- `dnaTwist` (number) – Degrees of twist per rung along the helix. Defaults to `60`.
- `startAngle` (number) – The starting angle in degrees for the helix rotation.
- `rotateToCenter` (boolean) – Rotates each component to face the layout's center point.
- `rotationOffset` (number) – Extra rotation in degrees applied when `rotateToCenter` is `true`.

#### Reel Spinner Layout
- `spinDegrees` (number) – Rotation angle in degrees for the entire cylinder. Defaults to `0`.
- `radius` (number) – The radius of the cylinder. Defaults to `250`.
- `itemAngleStep` (number) – Angular spacing between items in degrees. Defaults to `30`.
- `depthScale` (number) – Controls how much items scale based on depth. Defaults to `0.5`.
- `vertical` (boolean) – If `true`, items move vertically; if `false`, horizontally. Defaults to `true`.
- `width`, `height` (number) – The dimensions of the layout bounds. Defaults to `200` and `400`.

#### Data-Driven Layouts (Treemap, Bubble, WordCloud)
These layouts rely on a `value` property on each LayoutComponent.

- `width`, `height` (number) – The total bounds for the Treemap and Voronoi layouts.
- `iterations` (number) – Number of simulation steps for Bubble and WordCloud.
- `centerStrength` (number) – The force pulling bubbles to the center.
- `spiralTightness` (number) – How tightly the spiral is wound when placing words in WordCloud.

---

### External Parsers

Some layouts require external libraries to function. You must provide them in the options.

#### Path Layout
Requires a path parser compatible with `svg-path-properties`.

**Installation:**
```bash
npm install svg-path-properties
```

**Usage:**
```js
import { Properties } from 'svg-path-properties';

applyLayout(container, {
  layoutName: layoutEnum.PATH,
  path: 'M 0 0 C 50 150, 150 -50, 200 100',
  pathParser: Properties,
  rotateToPath: true,
});
```

#### Voronoi Layout
Requires a Voronoi/Delaunay utility compatible with `d3-delaunay`.

**Installation:**
```bash
npm install d3-delaunay
```

**Usage:**
```js
import { Delaunay } from 'd3-delaunay';

applyLayout(container, {
  layoutName: layoutEnum.VORONOI,
  width: 800,
  height: 600,
  voronoiParser: Delaunay,
});
```

---

## 📐 Return Value & Positioning

The internal layout functions return a `Bounds` object describing the bounding box of the positioned components:

```ts
interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
```

The main `applyLayout` function uses this to calculate the total width (`maxX - minX`) and height (`maxY - minY`) and **automatically centers the layout** by adjusting the container's `pivot` property.

### Understanding Container Positioning

After `applyLayout` is called, the container's `pivot` is set to the center of the layout. This means:

1. The layout is centered at the container's position
2. To place the layout at a specific screen coordinate, set `container.position` to that coordinate
3. The layout will be centered around that position

**Example:**
```js
// Apply layout (centers automatically)
applyLayout(container, { layoutName: layoutEnum.CIRCLE, radius: 200 });

// Position the centered layout at screen center
container.position.set(app.screen.width / 2, app.screen.height / 2);
```

### Manual Positioning

If you need to disable automatic centering or handle positioning manually:

```js
// Get the bounds manually (if needed)
// Note: applyLayout doesn't return bounds, but you can calculate them
// from the children after layout is applied

// Position container manually
container.position.set(100, 100);
container.pivot.set(0, 0); // Reset pivot if needed
```

---

## 📝 Comprehensive Examples

### Example 1: Square Grid with Snake Flow

```js
import * as PIXI from 'pixi.js';
import { applyLayout, layoutEnum } from "pixi-layout-engine";

const container = new PIXI.Container();
const sprites = [];

// Create 20 sprites
for (let i = 0; i < 20; i++) {
  const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  sprite.width = 50;
  sprite.height = 50;
  sprite.tint = 0x00ff00;
  sprites.push(sprite);
  container.addChild(sprite);
}

// Apply snake flow grid
applyLayout(container, {
  layoutName: layoutEnum.SQUARE,
  columns: 4,
  spacing: 20,
  flowDirection: "snake",
  lastRowAlign: "center",
});

// Position on screen
container.position.set(400, 300);
app.stage.addChild(container);
```

### Example 2: Path Layout with External Parser

```js
import { Properties } from 'svg-path-properties';
import { applyLayout, layoutEnum } from "pixi-layout-engine";

const container = new PIXI.Container();
// ... add components ...

applyLayout(container, {
  layoutName: layoutEnum.PATH,
  path: 'M 0 0 C 50 150, 150 -50, 200 100',
  pathParser: Properties,
  rotateToPath: true,
});
```

### Example 3: Circle Packing with Values

```js
import { applyLayout, layoutEnum } from "pixi-layout-engine";

const container = new PIXI.Container();
const items = [];

// Create items with values
data.forEach((item, i) => {
  const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  sprite.value = item.value; // Important: set value property
  items.push(sprite);
  container.addChild(sprite);
});

applyLayout(container, {
  layoutName: layoutEnum.CIRCLE_PACK,
  boundsRadius: 300,
  padding: 5,
  iterations: 200,
});
```

### Example 4: Card Hand Layout for Game UI

```js
import { applyLayout, layoutEnum } from "pixi-layout-engine";

const handContainer = new PIXI.Container();
const cards = [];

// Create card sprites
for (let i = 0; i < 5; i++) {
  const card = new PIXI.Sprite(cardTexture);
  card.width = 80;
  card.height = 120;
  cards.push(card);
  handContainer.addChild(card);
}

applyLayout(handContainer, {
  layoutName: layoutEnum.CARD_HAND,
  arcRadius: 400,
  arcAngle: 35
});

// Position at bottom of screen
handContainer.position.set(app.screen.width / 2, app.screen.height - 100);
app.stage.addChild(handContainer);
```

### Example 5: Messy Discard Pile

```js
import { applyLayout, layoutEnum } from "pixi-layout-engine";

const discardPile = new PIXI.Container();
const cards = [];

// Create discard pile cards
discardedCards.forEach(() => {
  const card = new PIXI.Sprite(cardTexture);
  discardPile.addChild(card);
});

applyLayout(discardPile, {
  layoutName: layoutEnum.STACK,
  offsetX: 0.5,
  offsetY: 0.5,
  offsetRotation: 0.2 // Slight rotation for natural look
});
```

### Example 6: Betting Table with Zones

```js
import { applyLayout, layoutEnum } from "pixi-layout-engine";

const tableContainer = new PIXI.Container();
const bettingZones = [
  { name: 'pass_line', bounds: { x: 0, y: 100, width: 400, height: 50 } },
  { name: 'big_6', bounds: { x: 420, y: 0, width: 80, height: 80 } },
  { name: 'big_8', bounds: { x: 420, y: 100, width: 80, height: 80 } }
];

const chips = [];

// Create chips and assign zones
bettingData.forEach((bet) => {
  const chip = new PIXI.Sprite(chipTexture);
  chip.zoneName = bet.zone; // Assign zone name
  chips.push(chip);
  tableContainer.addChild(chip);
});

applyLayout(tableContainer, {
  layoutName: layoutEnum.PAYOUT_ZONES,
  zones: bettingZones,
  zoneLayout: layoutEnum.BUBBLE // Arrange chips in each zone like a pile
});
```

### Example 7: Animated Reel Spinner

```js
import { applyLayout, layoutEnum } from "pixi-layout-engine";

const reelContainer = new PIXI.Container();
const symbols = [];

// Create reel symbols
for (let i = 0; i < 10; i++) {
  const symbol = new PIXI.Sprite(symbolTexture);
  reelContainer.addChild(symbol);
}

let spinAngle = 0;

// Animation loop
app.ticker.add(() => {
  spinAngle += 2; // Rotate 2 degrees per frame
  
  applyLayout(reelContainer, {
    layoutName: layoutEnum.REEL_SPINNER,
    spinDegrees: spinAngle,
    radius: 250,
    itemAngleStep: 30,
    depthScale: 0.5,
    vertical: true,
  });
});
```

### Example 8: Data-Driven Treemap

```js
import { applyLayout, layoutEnum } from "pixi-layout-engine";

const treemapContainer = new PIXI.Container();
const items = [];

// Create items from data
salesData.forEach((region) => {
  const rect = new PIXI.Graphics();
  rect.beginFill(0x3498db);
  rect.drawRect(0, 0, 1, 1); // Size will be calculated by layout
  rect.value = region.sales; // Set value for treemap
  items.push(rect);
  treemapContainer.addChild(rect);
});

applyLayout(treemapContainer, {
  layoutName: layoutEnum.TREEMAP,
  width: 800,
  height: 600,
});

// Items are now sized proportionally to their values
```

### Example 9: Responsive Layout with Orientation

```js
import { applyLayout, layoutEnum } from "pixi-layout-engine";

const container = new PIXI.Container();
// ... add components ...

const responsiveConfig = {
  layoutName: layoutEnum.SQUARE,
  spacing: 15,
  
  portrait: {
    columns: 3,
    flowDirection: "default",
  },
  
  landscape: {
    columns: 6,
    flowDirection: "snake",
  },
};

function updateLayout() {
  const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  applyLayout(container, {
    ...responsiveConfig,
    orientation,
  });
}

window.addEventListener('resize', updateLayout);
updateLayout();
```

### Example 10: Grid with Spanning Items

```js
import { applyLayout, layoutEnum } from "pixi-layout-engine";

const container = new PIXI.Container();
const items = [];

// Create regular items
for (let i = 0; i < 10; i++) {
  const item = new PIXI.Sprite(PIXI.Texture.WHITE);
  item.width = 50;
  item.height = 50;
  items.push(item);
  container.addChild(item);
}

// Create a featured item that spans multiple cells
const featured = new PIXI.Sprite(PIXI.Texture.WHITE);
featured.width = 50;
featured.height = 50;
featured.colSpan = 2; // Spans 2 columns
featured.rowSpan = 2; // Spans 2 rows
featured.tint = 0xff0000;
container.addChild(featured);

applyLayout(container, {
  layoutName: layoutEnum.SQUARE,
  columns: 4,
  spacing: 10,
  useGridSpanning: true, // Enable spanning support
});
```

---

## 🎯 Best Practices

### Performance Optimization

1. **Batch Layout Updates**: If you need to update layouts frequently, consider batching updates or using a debounce/throttle mechanism.

```js
let updateTimeout;
function scheduleLayoutUpdate() {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    applyLayout(container, options);
  }, 16); // ~60fps
}
```

2. **Reuse Containers**: Reuse container objects when possible rather than creating new ones.

3. **Fixed Sizing**: Use `sizingMode: "fixed"` when all items have the same size for better performance.

4. **Limit Iterations**: For physics-based layouts (Bubble, Circle Pack), use reasonable `iterations` values (200-300 is usually sufficient).

### Type Safety with TypeScript

```ts
import { applyLayout, layoutEnum, type LayoutOptions } from "pixi-layout-engine";

// Type-safe options
const options: LayoutOptions = {
  layoutName: layoutEnum.SQUARE,
  columns: 4,
  spacing: 20,
  // TypeScript will catch typos and invalid values
};

applyLayout(container, options);
```

### Component Property Management

Always set component-specific properties (like `value`, `colSpan`, `zoneName`) **before** calling `applyLayout`:

```js
// ✅ Correct order
sprite1.value = 50;
sprite1.colSpan = 2;
applyLayout(container, options);

// ❌ Wrong - properties set after layout won't be used
applyLayout(container, options);
sprite1.value = 50;
```

### Layout Switching

When switching between layouts, you may want to reset component properties:

```js
function switchLayout(newLayoutName) {
  // Reset component properties if needed
  container.children.forEach(child => {
    delete child.value;
    delete child.colSpan;
    delete child.rowSpan;
    delete child.zoneName;
  });
  
  applyLayout(container, {
    layoutName: newLayoutName,
    // ... other options
  });
}
```

### Error Handling

```js
try {
  applyLayout(container, options);
} catch (error) {
  console.error('Layout application failed:', error);
  // Fallback to default layout
  applyLayout(container, { layoutName: layoutEnum.SQUARE });
}
```

---

## 🔧 Troubleshooting

### Layout Not Appearing

**Problem**: Components are positioned but not visible.

**Solutions**:
- Check that components are added to the container before calling `applyLayout`
- Verify container is added to the stage
- Check component visibility: `sprite.visible = true`
- Ensure components have non-zero width/height

### Components Overlapping

**Problem**: Items are overlapping when they shouldn't.

**Solutions**:
- Increase `spacing` value
- Check if `sizingMode` is correctly set
- Verify component dimensions are correct
- For grid layouts, ensure `columns` is appropriate for item count

### Layout Not Centering

**Problem**: Layout appears off-center.

**Solutions**:
- Remember that `applyLayout` centers via `pivot`, not `position`
- Set `container.position` to your desired screen coordinates after layout
- Check that container's `pivot` hasn't been manually modified

### Performance Issues

**Problem**: Layout application is slow.

**Solutions**:
- Reduce `iterations` for physics-based layouts
- Use `sizingMode: "fixed"` when possible
- Limit the number of components
- Consider using simpler layouts for large numbers of items

### TypeScript Errors

**Problem**: Type errors when using the library.

**Solutions**:
- Ensure you're importing types correctly: `import type { LayoutOptions } from "pixi-layout-engine"`
- Check that your PIXI.js version matches the peer dependency requirements
- Verify component objects match the `LayoutComponent` interface

---

## 🔔 Important Notes

- If the `layoutName` option is omitted, the system defaults to `layoutEnum.SQUARE`.
- If an unknown `layoutName` is provided, the system defaults to a horizontal `LINE` layout.
- The container's position is automatically managed to center the layout. To place the centered layout on your screen, simply add the container's final position to your desired screen coordinates (e.g., `container.x += screen.width / 2`).
- Component-specific properties (`value`, `colSpan`, `rowSpan`, `zoneName`, `group`) must be set **before** calling `applyLayout`.
- The library is designed to work with any object that implements the `LayoutComponent` interface, not just PIXI.js objects.
- Layout calculations are synchronous and blocking. For very large numbers of components, consider using Web Workers or breaking into chunks.

---

## 📚 API Reference

### Functions

#### `applyLayout(container: LayoutContainer, options?: LayoutOptions): void`

Applies a layout to the children of a container.

**Parameters:**
- `container` (LayoutContainer): The container whose children will be laid out. Must have `children`, `position`, and `pivot` properties.
- `options` (LayoutOptions, optional): Configuration object for the layout.

**Returns:** `void`

**Side Effects:**
- Modifies the `position` property of all children in `container.children`
- Modifies the `pivot` property of `container` to center the layout
- May modify `rotation`, `scale`, `visible`, and `zIndex` properties of children (depending on layout)

### Types

#### `LayoutContainer`

```ts
interface LayoutContainer {
  position: { x: number; y: number; set(x: number, y: number): void };
  pivot: { x: number; y: number; set(x: number, y: number): void };
  children: LayoutComponent[];
}
```

#### `LayoutComponent`

```ts
interface LayoutComponent {
  position: Vec2;
  rotation?: number;
  scale?: Vec2;
  width: number;
  height: number;
  value?: number;
  colSpan?: number;
  rowSpan?: number;
  visible?: boolean;
  zoneName?: string;
  group?: string;
  tint?: number;
  stretch?: number;
}
```

#### `LayoutOptions`

A comprehensive interface with all possible layout options. See the Options Reference section for details.

#### `LayoutName`

```ts
type LayoutName = 
  | 'line'
  | 'circle'
  | 'square'
  | 'perimeter-grid'
  | 'flex-wrap'
  | 'spiral'
  | 'wave'
  | 'masonry'
  | 'phyllotaxis'
  | 'path'
  | 'perspective'
  | 'isometric'
  | 'treemap'
  | 'bubble'
  | 'voronoi'
  | 'word-cloud'
  | 'circle-pack'
  | 'card-hand'
  | 'stack'
  | 'payout-zones'
  | 'spread-explosion'
  | 'pyramid'
  | 'orbit'
  | 'dna'
  | 'REEL_SPINNER';
```

#### `layoutEnum`

An object containing all layout name constants:

```ts
const layoutEnum = {
  LINE: 'line',
  CIRCLE: 'circle',
  SQUARE: 'square',
  // ... etc
} as const;
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the GNU General Public License v2.0.

---

## 🙏 Acknowledgments

- Built for the PixiJS community
- Inspired by CSS Grid, Flexbox, and various layout algorithms
- Thanks to all contributors and users

---

For more examples and live demos, visit the [Live Editor](https://lukasz-okuniewicz.github.io/pixi-layout-engine-ui/).
