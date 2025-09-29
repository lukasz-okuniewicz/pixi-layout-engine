### pixi-layout-engine by [@lukasz-okuniewicz](http://github.com/lukasz-okuniewicz)

# Layout Controller

A flexible layout utility for arranging display objects (e.g., PIXI.js components) inside a container.
It provides multiple layout strategies such as horizontal, vertical, circle, grid, and various creative and data-driven patterns.

---

### Support My Work
If you find **pixi-layout-engine** useful and would like to support my work, you can buy me a coffee. Your contributions help me dedicate more time to improving this library and creating new features for the community. Thank you for your support! ☕💖

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support%20My%20Work-orange?logo=buy-me-a-coffee&logoColor=white)](https://buymeacoffee.com/lukasz.okuniewicz)

---

## 🎮 Demo
Try it out here: [pixi-layout-engine Live Editor](https://lukasz-okuniewicz.github.io/pixi-layout-engine-ui/)

---

## 📦 Installation

```js
npm i pixi-layout-engine
```

```js
import { applyLayout, layoutEnum } from "pixi-layout-engine";
```

---

## 🚀 Usage

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

---

## 🗂️ Layout Types

### Basic Layouts
| Layout Enum | Description                                                                                                            |
|-------------|------------------------------------------------------------------------------------------------------------------------|
| `LINE`      | Universal layout for arranging items in a single, non-wrapping line at any angle (horizontal, vertical, or diagonal).  |
| `STACK`     | Creates a pile of overlapping items, like a deck of cards or chips.                                                    |

### Grid Layouts
| Layout Enum       | Description                                                                                                                                       |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `SQUARE`          | An extremely versatile grid with dozens of flowDirection patterns for arranging items, plus an optional mode for item spanning (colSpan/rowSpan). |
| `PAYOUT_ZONES`    | Places components into predefined rectangular areas on a game board.                                                                              |
| `PYRAMID`         | Arranges items in centered, tiered rows, perfect for prize tables. Can be oriented vertically or horizontally.                                    |
| `FLEX_WRAP`       | Arranges items in rows, wrapping when maxWidth is exceeded.                                                                                       |
| `MASONRY`         | Pinterest-style layout where items are packed in columns of variable height.                                                                      |
| `PERIMETER_GRID`  | Arranges components along the outer edge of a rectangular grid, with extensive customization.                                                     |
| `ISOMETRIC`       | Arranges items on a 2.5D isometric grid.                                                                                                          |

### Creative & Algorithmic Layouts
| Layout Enum           | Description                                                                                                                                     |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `CIRCLE`              | Distributes components in a circular, arc, spiral, or donut pattern. Supports data-driven distribution, sorting, and organic "jitter" effects.  |
| `CARD_HAND`           | Arranges components in a fanned-out arc, like a hand of cards.                                                                                  |
| `SPREAD_EXPLOSION`    | Scatters items outwards in a semi-random burst, like a loot drop.                                                                               |
| `SPIRAL`              | Arranges components in an Archimedean spiral from the center outwards.                                                                          |
| `PHYLLOTAXIS`         | Arranges items in a spiral pattern inspired by sunflower seeds.                                                                                 |
| `WAVE`                | Places components along a sine wave.                                                                                                            |
| `PATH`                | Distributes items along a specified SVG path. (Requires a path parser)                                                                          |
| `PERSPECTIVE`         | Creates a 3D depth effect by scaling items towards a vanishing point.                                                                           |

### Data-Driven Layouts
| Layout Enum      | Description                                                                |
|------------------|----------------------------------------------------------------------------|
| `TREEMAP`        | Space-filling layout where item size is proportional to its value.         |
| `BUBBLE`         | Tightly packs items (as circles) using a physics-based simulation.         |
| `CIRCLE_PACK`    | Packs items (as circles) into a containing circle, great for proportions.  |
| `VORONOI`        | Partitions the space into cells around each component. (Requires a parser) |
| `WORD_CLOUD`     | Arranges items like a word cloud, with larger items near the center.       |

---

## ⚙️ Options

Each layout accepts different options for customization:

### Component-Specific Properties
Some layouts respond to properties set on the individual `LayoutComponent` objects themselves.
- `value` (number) – Used by all **Data-Driven Layouts** (like `BUBBLE`, `TREEMAP`) and by the `SQUARE` grid's `value-weighted-*` flow directions to determine size or sort order.
- `group` (string) – For the `SQUARE` grid's `clustered-fill` flow, specifies which visual group an item belongs to.
- `colSpan` (number) – For the `SQUARE` grid (in `useGridSpanning` mode), specifies how many columns an item should occupy.
- `rowSpan` (number) – For the `SQUARE` grid (in `useGridSpanning` mode), specifies how many rows an item should occupy.
- `zoneName` (string) – For the `PAYOUT_ZONES` layout, specifies which named zone an item belongs to.
The CIRCLE_PACK layout relies on the value property, just like the other data-driven layouts. While value is already mentioned in the Data-Driven Layouts section, it's good practice to ensure it's clearly associated. Your current documentation for this is already sufficient as it covers all data-driven layouts.

### General Options
These options are used by many different layouts.
- `spacing` (number) – Gap between components (default: `0`).
- `sizingMode` (`"auto"` | `"fixed"`) – Determines whether child sizes are auto-detected or fixed.
- `fixedWidth`, `fixedHeight` (number) – Used with `"fixed"` sizing mode to enforce dimensions.

### Grid-like Layouts (Square, Masonry, etc.)
- `columns` (number) – The number of columns in the grid.
- `rows` (number) – The number of rows (used by Perimeter).
- `columnGap` (number) – Horizontal gap between columns. Defaults to spacing.
- `rowGap` (number) – Vertical gap between rows. Defaults to spacing.
- `alignItems` (`"start"` | `"center"` | `"end"`) – Vertical alignment of items within their grid cell.
- `justifyItems` (`"start"` | `"center"` | `"end"`) – Horizontal alignment of items within their grid cell.

### Specific Layout Options
- **Line Layout**
  - `angle` (number) – The angle of the line in degrees. 0 is horizontal, 90 is vertical.
  - `spacing` (number) – The gap between items along the line.
  - `isReversed` (boolean) – Reverses the order of components along the line.
  - `alignItems` (`"start"` | `"center"` | `"end"`) – Cross-axis alignment of items relative to the line's angle.

- **Stack Layout**
  - `offsetX`, `offsetY` (number) – The horizontal and vertical pixel offset for each subsequent item in the stack.
  - `offsetRotation` (number) – The incremental rotation in degrees for each item, creating a more natural, messy look.

- **Payout Zones Layout**
  - `zones` (`{ name: string, bounds: { x, y, width, height } }[]`) – An array of named rectangular zones that define the layout areas.
  - `zoneLayout` (string) – The `layoutName` of another simple layout (e.g., `SQUARE`, `BUBBLE`) to apply to the items *within* each zone. Defaults to random placement.

- **Circle Layout**
  - A flexible circular layout system with support for arcs, spirals, organic effects, and value-based distribution.
    - **Basic Controls**
      - **`radius`** (number) – The base distance of each component from the center.
      - **`innerRadius`** (number) – Creates a "hole" in the middle, forming a donut shape.
      - **`autoRadius`** (boolean) – If `true`, calculates the perfect radius to fit all components based on their size.
      - **`spacing`** (number) – The pixel gap between items. Only has an effect when `autoRadius` is `true`.
    - **Arc & Angle Controls**
      - **`startAngle`**, **`endAngle`** (number) – The start and end angles in degrees, allowing for partial arcs.
      - **`angularSpacing`** (number) – A fixed gap in degrees between each component.
      - **`justifyArc`** (`"start"` | `"center"`) – Alignment of items within a partial arc (has no effect on a full 360° circle).
    - **Distribution & Sorting**
      - **`sortBy`** (`"value"` | `"name"` | function) – Sorts components before arranging them.
      - **`sortDirection`** (`"asc"` | `"desc"`) – The direction for sorting.
      - **`distributeByValue`** (boolean) – Allocates angular space to each item based on its `.value` property.
    - **Shape & Form**
      - **`spiralFactor`** (number) – Increases the radius for each item, transforming the circle into a spiral.
      - **`rotateToCenter`** (boolean) – Rotates each component to face the layout's center point.
      - **`rotationOffset`** (number) – An extra rotation in degrees applied to items when `rotateToCenter` is `true`.
    - **Organic Effects**
      - **`radiusJitter`** (number) – Max random pixel offset applied to each item's radius.
      - **`angleJitter`** (number) – Max random degree offset applied to each item's angle.

- **Card Hand Layout**
  - `arcRadius` (number) – The distance from the central pivot point to the center of each card.
  - `arcAngle` (number) – The total angle of the fan. A larger angle creates a wider spread.

- **Circle Pack Layout**
  - `boundsRadius` (number) – The radius of the invisible outer circle that contains the packed items.
  - `padding` (number) – The minimum pixel gap to enforce between each packed circle.
  - `iterations` (number) – The number of simulation passes to run for stabilization.
  - `centerStrength` (number) – A gravity-like force that pulls all circles towards the center.
  - `radiusScale` (number) – A multiplier to adjust the final size of the circles derived from their `value`.

- **Pyramid Layout**
  - `tiers` (`number[]`) – An array of numbers defining the item count for each row, from top to bottom (e.g., `[1, 2, 3]`).
  - `direction` (`"up"` | `"down"` | `"left"` | `"right"`) – The primary direction the pyramid is built in.
  - `rowGap / itemSpacing` (number) – Gaps between tiers (main axis) and items within a tier (cross axis).
  - `alignment` (`"top"` | `"center"` | `"end"`) – The vertical alignment of the entire pyramid structure.
  - `tierAlignment` (`"start"` | `"center"` | `"end"`) – The alignment of tiers relative to each other on the cross axis.
  - `justifyTierContent` (`"start"` | `"center"` | `"end"` | `"space-between"` | `"space-around"`) – How to distribute items within a tier if useActualSize is true and there is extra space.
  - `useActualSize` (boolean) – If true, tiers are sized based on the actual dimensions of their contents rather than a uniform grid.
  - `sortBy` (string | function) – Sorts components before arranging them into tiers.
  - `sortDirection` (`"asc"` | `"desc"`) – The direction for sorting.
  - `staggerOffset` (number) – An additional offset applied to each subsequent tier on the cross-axis.

- **Spread Explosion Layout**
  - `maxRadius` (number) – The maximum distance any item can be scattered from the center.
  - `spreadFactor` (number) – Controls the density of the underlying spiral pattern.
  - `randomness` (number) – A value from 0 to 1 that controls the amount of chaos. `0` is a perfect spiral; `1` is completely random.

- **Square/Grid Layout**
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

- **Perimeter Grid**
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

- **Flex Wrap Layout**
    - `maxWidth` (number) – The maximum width of a line before components wrap to the next.
    - `maxHeight` (number) – The total container height to align content within.
    - `justifyContent` (`"start"` | `"center"` | `"end"` | `"space-between"` | `"space-around"`) – How space is distributed between items on a line.
    - `alignContent` (`"start"` | `"center"` | `"end"` | `"space-between"` | `"space-around"` | `"stretch"`) – How rows are distributed vertically if there is extra space in maxHeight.

- **Spiral Layout**
  - `separation` (number) – Distance between the arms of the spiral.
  - `tightness` (number) – Controls how tightly the spiral is wound.

- **Wave Layout**
  - `amplitude` (number) – The height of the wave's crests and troughs.
  - `frequency` (number) – How many waves appear over a given distance; affects the wavelength.

- **Path Layout**
  - `path` (string) – An SVG path data string (e.g., "M0,0 L100,100").
  - `pathParser` (class) – A constructor for an SVG path parsing utility.
  - `rotateToPath` (boolean) – If true, rotates components to match the angle of the path.

- **Perspective Layout**
  - `vanishingPoint` (`{ x: number, y: number }`) – The point on the canvas where lines converge.
  - `depthSpacing` (number) – A factor determining how much items shrink with each row. Values `< 1` recede, values `> 1` come forward.
  - `scale` (number) – An overall scale factor to shrink or enlarge the entire projection. Defaults to `0.5`.

- **Isometric Layout**
  - `tileWidth`, `tileHeight` (number) – The screen dimensions of a single isometric tile.

- **Data-Driven Layouts (Treemap, Bubble, WordCloud)**
  - These layouts rely on a value property on each LayoutComponent.
    - `width`, `height` (number) – The total bounds for the Treemap and Voronoi layouts.
    - `iterations` (number) – Number of simulation steps for Bubble and WordCloud.
    - `centerStrength` (number) – The force pulling bubbles to the center.
    - `spiralTightness` (number) – How tightly the spiral is wound when placing words in WordCloud.

### External Parsers
Some layouts require external libraries to function. You must provide them in the options.
- **Path Layout**: Requires a path parser compatible with svg-path-properties.
- **Voronoi Layout**: Requires a Voronoi/Delaunay utility compatible with d3-delaunay.

---

## 📐 Return Value

The internal layout functions return a Bounds object describing the bounding box of the positioned components:

```js
{
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
}
```
The main `applyLayout` function uses this to calculate the total width (maxX - minX) and height (maxY - minY) and **automatically centers the layout** by adjusting the container's position.

---

## 📝 Example

```js
// Square grid with spacing and snake flow
applyLayout(container, {
  layoutName: layoutEnum.SQUARE,
  columns: 4,
  spacing: 20,
  flowDirection: "snake",
  lastRowAlign: "center",
});
```

```js
// Path layout using an external parser
import { Properties } from 'svg-path-properties';

applyLayout(container, {
  layoutName: layoutEnum.PATH,
  path: 'M 0 0 C 50 150, 150 -50, 200 100',
  pathParser: Properties, // Pass the class constructor
  rotateToPath: true,
});
```

```js
// A Circle Packing layout
// Ensure each component has a `value` property, e.g., sprite1.value = 50;
applyLayout(container, {
  layoutName: layoutEnum.CIRCLE_PACK,
  boundsRadius: 300,
  padding: 5
});
```

```js
// A Card Hand layout for a game UI
applyLayout(container, {
  layoutName: layoutEnum.CARD_HAND,
  arcRadius: 400,
  arcAngle: 35
});
```

```js
// Creating a messy discard pile for a card game
applyLayout(container, {
  layoutName: layoutEnum.STACK,
  offsetX: 0.5,
  offsetY: 0.5,
  offsetRotation: 0.2 // A very slight rotation per card
});
```

```js
// A layout for a betting table with chips in different zones
const bettingZones = [
  { name: 'pass_line', bounds: { x: 0, y: 100, width: 400, height: 50 } },
  { name: 'big_6', bounds: { x: 420, y: 0, width: 80, height: 80 } }
];

// Assign zoneName to each chip component
chip1.zoneName = 'pass_line';
chip2.zoneName = 'big_6';
chip3.zoneName = 'pass_line';

// Make sure chip1, chip2, and chip3 have been added to the container.
// e.g., container.addChild(chip1, chip2, chip3);

applyLayout(container, {
  layoutName: layoutEnum.PAYOUT_ZONES,
  zones: bettingZones,
  zoneLayout: layoutEnum.BUBBLE // Arrange chips in each zone like a pile
});
```

---

## 🔔 Notes
- If the `layoutName` option is omitted, the system defaults to `layoutEnum.SQUARE`.
- If an unknown `layoutName` is provided, the system defaults to a horizontal `LINE` layout.
- The container's position is automatically managed to center the layout. To place the centered layout on your screen, simply add the container's final position to your desired screen coordinates (e.g., container.x += screen.width / 2).

---
