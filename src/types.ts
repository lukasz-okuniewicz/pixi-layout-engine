import type {layoutEnum} from './layoutEnum.js';

export type LayoutName = typeof layoutEnum[keyof typeof layoutEnum];

export type Orientation = 'portrait' | 'landscape';

export interface Zone {
    name: string;
    bounds: { x: number, y: number, width: number, height: number };
}

export interface Vec2 {
    x: number;
    y: number;
    set(x: number, y: number): void;
}

/**
 Represents a component that can be positioned and has dimensions.
 This is a generic interface that should be compatible with display objects
 from rendering libraries like PixiJS.
 */
export interface LayoutComponent {
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
    tint?: number;
    stretch?: number;
}

/**
 * An interface describing the instance returned by a Voronoi/Delaunay utility.
 */
export interface VoronoiInstance {
    voronoi(bounds: [number, number, number, number]): {
        cellPolygon(index: number): [number, number][];
    };
}

/**
 * An interface for a Voronoi/Delaunay utility's static methods.
 * We specifically need the `.from()` factory method.
 */
export interface VoronoiParser {
    new(points: number[]): VoronoiInstance;
}

/**
 Represents a container that can be positioned.
 */
export interface LayoutContainer {
    position: {
        x: number;
        y: number;
        set(x: number, y: number): void;
    };
    pivot: {
        x: number;
        y: number;
        set(x: number, y: number): void;
    };
    children: LayoutComponent[];
}

/**
 Represents the bounding box of a layout.
 */
export interface Bounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

/**
 An interface for an SVG path parsing utility.
 This allows users to provide their own path parser to keep the core library dependency-free.
 Compatible with libraries like svg-path-properties.
 */
export interface PathParser {
    new(path: string): {
        getTotalLength(): number;
        getPointAtLength(length: number): { x: number; y: number };
        getTangentAtLength(length: number): { x: number; y: number };
    };
}

type Alignment = 'start' | 'center' | 'end';

type JustifyContent = 'start' | 'center' | 'end' | 'space-between' | 'space-around';

/**
 A comprehensive set of options to configure various layouts.
 */
export interface LayoutOptions {
    layoutName?: string;
    spacing?: number;
    columns?: number;
    rows?: number;
    autoRows?: boolean;
    isVertical?: boolean;
    isReversed?: boolean;
    useGridSpanning?: boolean;
    sizingMode?: 'auto' | 'fixed';
    fixedWidth?: number;
    fixedHeight?: number;
    alignItems?: Alignment;
    justifyItems?: Alignment;
    columnGap?: number;
    rowGap?: number;
    justifyContent?: JustifyContent;
    maxWidth?: number;
    maxHeight?: number;
    radius?: number;
    startAngle?: number;
    endAngle?: number;
    radiusOffset?: ((child: LayoutComponent, index: number) => number) | number;
    rotateToCenter?: boolean;
    autoRadius?: boolean;
    innerRadius?: number;
    flowDirection?: string;
    flowReverse?: boolean;
    lastRowAlign?: Alignment;
    prioritizeCorners?: boolean;
    startCorner?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left';
    distribution?: string;
    cornerSortBy?: string;
    offset?: number;
    rotation?: string;
    alignContent?: Alignment | 'space-between' | 'space-around' | 'stretch';
    angle?: number;
    separation?: number;
    tightness?: number;
    amplitude?: number;
    frequency?: number;
    path?: string;
    pathParser?: any;
    rotateToPath?: boolean;
    honeycombOrientation?: 'pointy-top' | 'flat-top';
    vanishingPoint?: { x: number, y: number };
    depthSpacing?: number;
    tileWidth?: number;
    tileHeight?: number;
    width?: number;
    height?: number;
    iterations?: number;
    centerStrength?: number;
    voronoiParser?: any;
    spiralTightness?: number;
    padding?: number;
    boundsRadius?: number;
    passes?: number;
    radiusScale?: number;
    scale?: number;
    arcRadius?: number;
    arcAngle?: number;
    offsetX?: number;
    offsetY?: number;
    offsetRotation?: number;
    zones?: Zone[];
    zoneLayout?: string;
    maxRadius?: number;
    spreadFactor?: number;
    randomness?: number;
    tiers?: number[];
    itemSpacing?: number;
    alignment?: 'top' | 'center' | 'bottom';
    sortBy?: string | ((a: LayoutComponent, b: LayoutComponent) => number);
    sortDirection?: string;
    distributeByValue?: boolean;
    angularSpacing?: number;
    justifyArc?: string;
    spiralFactor?: number;
    rotationOffset?: number;
    radiusJitter?: number;
    angleJitter?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'clockwise' | 'counter-clockwise';
    tierAlignment?: string;
    justifyTierContent?: string;
    staggerOffset?: number;
    useActualSize?: boolean;
    braidRows?: number;
    blockWidth?: number;
    blockHeight?: number;
    orientation?: Orientation;
    portrait?: Partial<Omit<LayoutOptions, 'portrait' | 'landscape'>>;
    landscape?: Partial<Omit<LayoutOptions, 'portrait' | 'landscape'>>;
    /** Number of concentric orbits (rings). Used by orbit layout. */
    orbitCount?: number;
    /** Radial distance between orbits. Used by orbit layout. */
    orbitSpacing?: number;
    /** Angular offset in degrees added per orbit for stagger. Used by orbit layout. */
    orbitPhase?: number;
    /** Vertical distance between rungs (pairs of items). Used by DNA layout. */
    dnaPitch?: number;
    /** Degrees of twist per rung along the helix. Used by DNA layout. */
    dnaTwist?: number;
}