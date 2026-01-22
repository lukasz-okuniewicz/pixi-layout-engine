import {layoutEnum} from "./layoutEnum.js";
import type {Bounds, LayoutComponent, LayoutContainer, LayoutOptions} from "./types.js";

/**
 The main controller that applies a named layout to a container's components.
 The components to be laid out are taken directly from the container's `children` property.
 This function acts as a router, selecting the appropriate layout algorithm based on
 the layoutName in the options. After the components' positions are calculated,
 it centers the entire layout within the container by adjusting the container's position.

 It also supports responsive configurations by accepting `orientation`, `portrait`, and `landscape`
 properties in the options object. The appropriate configuration will be automatically merged.

 @param {LayoutContainer} container - The container object. Its `children` will be laid out, and its `position` property will be modified to center the final layout.
 @param {LayoutOptions} [options={}] - Configuration for the layout. Includes layoutName, orientation-specific overrides, and other properties specific to that layout (e.g., spacing, radius).
 */
const applyLayout = (container: LayoutContainer, options: LayoutOptions = {}): void => {
    const { orientation, portrait, landscape, sortBy, ...baseOptions } = options;
    let finalOptions: Omit<LayoutOptions, 'orientation' | 'portrait' | 'landscape' | 'sortBy'> = baseOptions;

    if (orientation === 'portrait' && portrait) {
        finalOptions = { ...finalOptions, ...portrait };
    } else if (orientation === 'landscape' && landscape) {
        finalOptions = { ...finalOptions, ...landscape };
    }

    let componentsToLayout: LayoutComponent[] = [...container.children];

    if (sortBy) {
        if (typeof sortBy === 'string') {
            componentsToLayout.sort((a, b) => {
                const valA = (a as any)[sortBy];
                const valB = (b as any)[sortBy];

                if (valA === undefined || valB === undefined) {
                    console.warn(`sortBy key "${sortBy}" not found on all components.`);
                    return 0;
                }

                if (valA < valB) return -1;
                if (valA > valB) return 1;
                return 0;
            });
        } else if (typeof sortBy === 'function') {
            componentsToLayout.sort(sortBy);
        }
    }

    const layoutName = finalOptions.layoutName || layoutEnum.SQUARE;
    container.pivot.set(0, 0);

    const layouts: Record<string, (c: LayoutComponent[], o: LayoutOptions) => Bounds> = {
        [layoutEnum.LINE]: _layoutLine,
        [layoutEnum.CIRCLE]: _layoutCircle,
        [layoutEnum.SQUARE]: _layoutSquare,
        [layoutEnum.PERIMETER_GRID]: _layoutPerimeterGrid,
        [layoutEnum.FLEX_WRAP]: _layoutFlexWrap,
        [layoutEnum.SPIRAL]: _layoutSpiral,
        [layoutEnum.WAVE]: _layoutWave,
        [layoutEnum.MASONRY]: _layoutMasonry,
        [layoutEnum.PHYLLOTAXIS]: _layoutPhyllotaxis,
        [layoutEnum.PATH]: _layoutPath,
        [layoutEnum.PERSPECTIVE]: _layoutPerspective,
        [layoutEnum.ISOMETRIC]: _layoutIsometric,
        [layoutEnum.TREEMAP]: _layoutTreemap,
        [layoutEnum.BUBBLE]: _layoutBubble,
        [layoutEnum.VORONOI]: _layoutVoronoi,
        [layoutEnum.WORD_CLOUD]: _layoutWordCloud,
        [layoutEnum.CIRCLE_PACK]: _layoutCirclePack,
        [layoutEnum.CARD_HAND]: _layoutCardHand,
        [layoutEnum.STACK]: _layoutStack,
        [layoutEnum.PAYOUT_ZONES]: _layoutPayoutZones,
        [layoutEnum.SPREAD_EXPLOSION]: _layoutSpreadExplosion,
        [layoutEnum.PYRAMID]: _layoutPyramid,
        [layoutEnum.REELS]: _layoutReels,
        [layoutEnum.REEL_SPINNER]: _layoutReelSpinner,
    };

    let bounds: Bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    if (layouts[layoutName]) {
        bounds = layouts[layoutName](componentsToLayout, finalOptions);
    } else {
        console.warn(`Layout "${layoutName}" not found. Defaulting to horizontal.`);
        bounds = _layoutLine(componentsToLayout, { ...finalOptions, isVertical: false });
    }
    const layoutWidth = bounds.maxX - bounds.minX;
    const layoutHeight = bounds.maxY - bounds.minY;
    container.pivot.x = (bounds.minX + layoutWidth / 2);
    container.pivot.y = (bounds.minY + layoutHeight / 2);
};

/**
 * Arranges components in a single line at any angle, with support for spacing
 * and alignment. This is the universal function for all single-line arrangements.
 *
 * @private
 * @param {LayoutComponent[]} components - The components to be arranged.
 * @param {LayoutOptions} options - Layout configuration.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutLine = (components: LayoutComponent[], options: LayoutOptions): Bounds => {
    if (components.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    const {
        angle = 0,
        spacing = 0,
        alignItems = 'start',
        isReversed: optionReversed = false,
        sizingMode,
        fixedWidth,
        fixedHeight,
    } = options;

    const angleRadians = angle * (Math.PI / 180);
    const perpAngle = angleRadians - Math.PI / 2;

    const cosAngle = Math.cos(angleRadians);
    const sinAngle = Math.sin(angleRadians);
    const cosPerpAngle = Math.cos(perpAngle);
    const sinPerpAngle = Math.sin(perpAngle);
    const cosAngleAbs = Math.abs(cosAngle);
    const sinAngleAbs = Math.abs(sinAngle);

    const isAngleReversed = angle > 90 && angle <= 270;
    const finalIsReversed = isAngleReversed !== optionReversed;
    const componentOrder = finalIsReversed ? [...components].reverse() : components;

    let maxCrossDim = 0;

    const componentDims = componentOrder.map(child => {
        const useFixed = sizingMode === 'fixed';
        const layoutWidth = useFixed && typeof fixedWidth === 'number' ? fixedWidth : child.width;
        const layoutHeight = useFixed && typeof fixedHeight === 'number' ? fixedHeight : child.height;
        const mainDim = (layoutWidth * cosAngleAbs) + (layoutHeight * sinAngleAbs);
        const crossDim = (layoutHeight * cosAngleAbs) + (layoutWidth * sinAngleAbs);

        if (crossDim > maxCrossDim) maxCrossDim = crossDim;
        return { mainDim, crossDim };
    });

    let currentMainPos = 0;
    componentOrder.forEach((child, i) => {
        const { mainDim, crossDim } = componentDims[i];

        const childCenterMain = currentMainPos + mainDim / 2;

        let childCenterCross: number;
        switch (alignItems) {
            case 'end': childCenterCross = maxCrossDim - crossDim / 2; break;
            case 'center': childCenterCross = maxCrossDim / 2; break;
            case 'start': default: childCenterCross = crossDim / 2; break;
        }

        const x = childCenterMain * cosAngle + childCenterCross * cosPerpAngle;
        const y = childCenterMain * sinAngle + childCenterCross * sinPerpAngle;
        child.position.set(x, y);

        currentMainPos += mainDim + spacing;
    });

    return _calculateBoundsFromComponents(components, options);
};

/**
 Calculates the bounding box that encloses a set of positioned components.
 This version is aware of `sizingMode` to work correctly on non-rendered objects.
 @private
 @param {LayoutComponent[]} components - The array of components that have already been positioned.
 @param {LayoutOptions} options - The layout options, used to check for fixed sizing.
 @returns {Bounds} An object representing the bounding box (minX, minY, maxX, maxY).
 */
const _calculateBoundsFromComponents = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const useFixed = options.sizingMode === 'fixed';
    const fixedWidth = options.fixedWidth ?? 0;
    const fixedHeight = options.fixedHeight ?? 0;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const child of components) {
        const childWidth = useFixed ? fixedWidth : child.width;
        const childHeight = useFixed ? fixedHeight : child.height;

        minX = Math.min(minX, child.position.x - childWidth / 2);
        minY = Math.min(minY, child.position.y - childHeight / 2);
        maxX = Math.max(maxX, child.position.x + childWidth / 2);
        maxY = Math.max(maxY, child.position.y + childHeight / 2);
    }
    return { minX, minY, maxX, maxY };
};

/**
 * Arranges components evenly in a circle, arc, annulus (donut), or spiral.
 * Supports data-driven distribution, sorting, and organic "jitter" effects.
 * @private
 * @param {LayoutComponent[]} components - The components to be arranged.
 * @param {LayoutOptions} [options={}] - Layout configuration.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutCircle = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    let {
        radius = 100,
        startAngle = 0,
        endAngle = 360,
        radiusOffset,
        autoRadius = false,
        innerRadius = 0,
        spacing = 0,
        sortBy = null,
        sortDirection = 'asc',
        distributeByValue = false,
        angularSpacing = 0,
        justifyArc = 'start',
        spiralFactor = 0,
        rotateToCenter = false,
        rotationOffset = 0,
        radiusJitter = 0,
        angleJitter = 0,
        perspectiveY = 1,
        depthScale = 0,
        enableZIndex = false,
        globalRotation = 0,
        maxScale = 1
    } = options as any;

    let componentsToLayout = components;

    if (enableZIndex && !sortBy) {
        componentsToLayout = [...components].sort((a: any, b: any) => {
            return (a.layoutId || 0) - (b.layoutId || 0);
        });
    }

    if (sortBy) {
        componentsToLayout = [...components];
        const sortFn = typeof sortBy === 'function' ? sortBy : (a: any, b: any) => ((a[sortBy] || 0) - (b[sortBy] || 0));
        componentsToLayout.sort(sortFn);
        if (sortDirection === 'desc') componentsToLayout.reverse();
    }

    const total = componentsToLayout.length;
    if (total === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    if (autoRadius) {
        const useFixed = options.sizingMode === "fixed";
        const fixedWidth = options.fixedWidth ?? 0;
        let totalCircumference = 0;
        for (const child of componentsToLayout) {
            totalCircumference += (useFixed ? fixedWidth : child.width) + spacing;
        }
        radius = totalCircumference / (2 * Math.PI);
    }

    const toRad = (deg: number): number => deg * (Math.PI / 180);
    const startRad = toRad(startAngle);
    const endRad = toRad(endAngle);
    const globalRotRad = toRad(globalRotation);

    let totalAngle = endRad - startRad;
    const totalAngularSpacing = toRad(angularSpacing) * (total > 1 ? total - 1 : 0);
    const effectiveTotalAngle = totalAngle - totalAngularSpacing;
    const isFullCircle = Math.abs(totalAngle) >= 2 * Math.PI - 0.001;

    let totalValue = 1;
    if (distributeByValue) {
        totalValue = componentsToLayout.reduce((sum, c) => sum + (c.value || 1), 0);
    }

    let angleOffset = 0;
    if (!isFullCircle && justifyArc !== 'start') {
        let contentAngle = distributeByValue ? effectiveTotalAngle : toRad(angularSpacing) * (total - 1);
        const remainingAngle = totalAngle - contentAngle;
        if (justifyArc === 'center') angleOffset = remainingAngle / 2;
    }

    let currentAngle = startRad + angleOffset;
    const baseRadius = innerRadius > 0 ? (radius + innerRadius) / 2 : radius;

    componentsToLayout.forEach((child, i) => {
        let angleForThisItem: number;

        if (distributeByValue) {
            const proportion = (child.value || 1) / totalValue;
            const angleSegment = proportion * effectiveTotalAngle;
            angleForThisItem = currentAngle + angleSegment / 2;
            currentAngle += angleSegment + toRad(angularSpacing);
        } else {
            const angleStep = effectiveTotalAngle / (isFullCircle ? total : (total > 1 ? total - 1 : 1));
            angleForThisItem = currentAngle;
            currentAngle += angleStep + toRad(angularSpacing);
        }

        if (angleJitter > 0) {
            angleForThisItem += toRad((Math.random() - 0.5) * 2 * angleJitter);
        }

        const finalAngle = angleForThisItem + globalRotRad;

        const individualRadiusOffset = typeof radiusOffset === 'function' ? radiusOffset(child, i) : (radiusOffset || 0);
        const spiralOffset = spiralFactor * i;
        const jitterOffset = (Math.random() - 0.5) * 2 * radiusJitter;
        const finalRadius = baseRadius + individualRadiusOffset + spiralOffset + jitterOffset;

        const rawX = finalRadius * Math.cos(finalAngle);
        const rawY = finalRadius * Math.sin(finalAngle);

        const x = rawX;
        const y = rawY * perspectiveY;

        child.position.set(x, y);

        const sineVal = Math.sin(finalAngle);
        const depthFactor = (sineVal + 1) / 2;

        if ((child as any).scale) {
            if (depthScale !== 0 || maxScale !== 1) {
                const backScale = maxScale * (1 - Math.min(depthScale, 0.99));
                const finalScale = backScale + (maxScale - backScale) * depthFactor;
                (child as any).scale.set(finalScale);
            } else {
                (child as any).scale.set(1);
            }
        }

        if (enableZIndex && (child as any).zIndex !== undefined) {
            (child as any).zIndex = Math.floor(depthFactor * 1000);
        }

        if (rotateToCenter && typeof child.rotation !== 'undefined') {
            const angle2D = Math.atan2(y, x);
            child.rotation = angle2D + Math.PI / 2 + toRad(rotationOffset);
        } else if (typeof child.rotation !== 'undefined') {
            child.rotation = 0;
        }
    });

    return _calculateBoundsFromComponents(componentsToLayout, options);
};

/**
 * Main router for the Square Grid layout.
 * It checks for layout options to decide which grid algorithm to use.
 * @private
 */
const _layoutSquare = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    let { useGridSpanning = false, flowDirection = "default" } = options;
    let componentsToLayout = components;

    for (const child of componentsToLayout) {
        if ((child as any).scale) { (child as any).scale.x = 1; }
        if ((child as any).visible !== undefined) { (child as any).visible = true; }
    }

    if (flowDirection === 'honeycomb' && useGridSpanning) {
        console.warn("Honeycomb flow does not support grid spanning. Ignoring spanning.");
        useGridSpanning = false;
    }

    if (flowDirection.startsWith('value-weighted')) {
        componentsToLayout = [...components].sort((a, b) => (b.value || 0) - (a.value || 0));
        flowDirection = flowDirection.replace('value-weighted-', '') || 'default';
    }

    if (flowDirection.startsWith('gravity-fill')) {
        return _layoutSquareGravityFill(componentsToLayout, options);
    }
    if (flowDirection === 'symmetric-outward') {
        return _layoutSquareSymmetricOutward(componentsToLayout, options);
    }
    if (flowDirection === 'clustered-fill') {
        return _layoutSquareClusteredFill(componentsToLayout, options);
    }
    if (flowDirection === 'boustrophedon') {
        return _layoutSquareBoustrophedon(componentsToLayout, options);
    }
    if (flowDirection === 'braid-flow') {
        return _layoutSquareBraidFlow(componentsToLayout, options);
    }
    if (flowDirection === 'interlaced-fill') {
        return _layoutSquareInterlaced(componentsToLayout, options);
    }
    if (flowDirection === 'random-walk') {
        return _layoutSquareRandomWalk(componentsToLayout, options);
    }
    if (flowDirection === 'hilbert-curve') {
        return _layoutSquareHilbertCurve(componentsToLayout, options);
    }
    if (flowDirection === 'perimeter-first') {
        return _layoutSquarePerimeterFirst(componentsToLayout, options);
    }
    if (flowDirection === 'z-order') {
        return _layoutSquareZOrder(componentsToLayout, options);
    }
    if (flowDirection === 'spiral-out' || flowDirection === 'spiral-in') {
        return _layoutSquareSpiral(componentsToLayout, { ...options, flowDirection });
    }
    if (flowDirection === 'diagonal-fill') {
        return _layoutSquareDiagonalFill(componentsToLayout, options);
    }
    if (flowDirection === 'block-fill') {
        return _layoutSquareBlockFill(componentsToLayout, options);
    }
    if (flowDirection === 'corner-converge') {
        return _layoutSquareCornerConverge(componentsToLayout, options);
    }
    if (flowDirection === 'diamond-fill') {
        return _layoutSquareDiamondFill(componentsToLayout, options);
    }

    if (useGridSpanning) {
        return _layoutSquareWithSpanning(componentsToLayout, { ...options, flowDirection });
    } else {
        return _layoutSquareSimple(componentsToLayout, { ...options, flowDirection });
    }
};

/**
 * Fills the grid based on proximity to a "gravity point," like an expanding ripple.
 * @private
 */
const _layoutSquareGravityFill = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 5, flowDirection = 'gravity-fill-center' } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    let gravityPoint = { r: Math.floor(totalRows / 2), c: Math.floor(columns / 2) };
    if (flowDirection.endsWith('-top-left')) gravityPoint = { r: 0, c: 0 };
    else if (flowDirection.endsWith('-top-right')) gravityPoint = { r: 0, c: columns - 1 };
    else if (flowDirection.endsWith('-bottom-left')) gravityPoint = { r: totalRows - 1, c: 0 };
    else if (flowDirection.endsWith('-bottom-right')) gravityPoint = { r: totalRows - 1, c: columns - 1 };
    else if (flowDirection.endsWith('-top')) gravityPoint = { r: 0, c: Math.floor(columns / 2) };
    else if (flowDirection.endsWith('-bottom')) gravityPoint = { r: totalRows - 1, c: Math.floor(columns / 2) };

    const positions: { r: number, c: number }[] = [];
    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < columns; c++) {
            positions.push({ r, c });
        }
    }

    positions.sort((a, b) => {
        const distA = Math.abs(a.r - gravityPoint.r) + Math.abs(a.c - gravityPoint.c);
        const distB = Math.abs(b.r - gravityPoint.r) + Math.abs(b.c - gravityPoint.c);
        if (distA === distB) return a.r === b.r ? a.c - b.c : a.r - b.r;
        return distA - distB;
    });

    components.forEach((child, i) => {
        if (i >= positions.length) return;
        const { r, c } = positions[i];
        const cellX = c * cellWidth;
        const cellY = r * cellHeight;
        child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
    });

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Fills the grid symmetrically from the center row outwards.
 * It fills the center row, then the row below, then the row above, and so on.
 * @private
 */
const _layoutSquareSymmetricOutward = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 5 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);
    const centerRow = Math.floor(totalRows / 2);

    const positions: { r: number; c: number }[] = [];

    if (centerRow < totalRows) {
        for (let c = 0; c < columns; c++) {
            positions.push({ r: centerRow, c });
        }
    }

    for (let offset = 1; offset <= Math.max(centerRow, totalRows - 1 - centerRow); offset++) {
        const rowBelow = centerRow + offset;
        if (rowBelow < totalRows) {
            for (let c = 0; c < columns; c++) {
                positions.push({ r: rowBelow, c });
            }
        }

        const rowAbove = centerRow - offset;
        if (rowAbove >= 0) {
            for (let c = 0; c < columns; c++) {
                positions.push({ r: rowAbove, c });
            }
        }
    }

    components.forEach((child, i) => {
        if (i >= positions.length) return;
        const pos = positions[i];

        const cellX = pos.c * cellWidth;
        const cellY = pos.r * cellHeight;
        child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
    });

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Partitions the grid into zones based on a 'group' property on each component,
 * then fills each zone with its corresponding components.
 * @private
 */
const _layoutSquareClusteredFill = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 10 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    const groups = new Map<string, LayoutComponent[]>();
    for (const comp of components) {
        const groupName = (comp as any).group || '__default__';
        if (!groups.has(groupName)) groups.set(groupName, []);
        groups.get(groupName)!.push(comp);
    }

    const sortedGroups = Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length);
    let currentX = 0;

    for (const [groupName, groupComponents] of sortedGroups) {
        const percentage = groupComponents.length / components.length;
        const zoneWidthInCells = Math.max(1, Math.round(columns * percentage));

        const zone = {
            x: currentX,
            y: 0,
            width: Math.min(zoneWidthInCells, columns - currentX),
            height: totalRows
        };

        groupComponents.forEach((child, i) => {
            if (i >= zone.width * zone.height) return;
            const r = Math.floor(i / zone.width);
            const c = i % zone.width;

            const cellX = (zone.x + c) * cellWidth;
            const cellY = (zone.y + r) * cellHeight;
            child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
        });
        currentX += zone.width;
    }

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Fills the grid like a snake, but also flips components horizontally on reversed rows.
 * This is a stylistic effect that assumes components have a `scale` property.
 * @private
 */
const _layoutSquareBoustrophedon = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 5 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);

    components.forEach((child, i) => {
        const row = Math.floor(i / columns);
        const baseCol = i % columns;
        const isReversedRow = row % 2 !== 0;
        const col = isReversedRow ? columns - 1 - baseCol : baseCol;

        const cellX = col * cellWidth;
        const cellY = row * cellHeight;
        child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);

        if ((child as any).scale) {
            (child as any).scale.x = isReversedRow ? -1 : 1;
        }
    });

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = Math.ceil(components.length / columns) * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Fills the grid by weaving between a set number of rows, wrapping to a new
 * set of rows when the column limit is reached.
 * @private
 */
const _layoutSquareBraidFlow = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 6 } = options;
    const { braidRows = 2 } = options as any;
    if (components.length === 0 || braidRows <= 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    const itemsPerBraidBlock = braidRows * columns;

    components.forEach((child, i) => {
        const blockIndex = Math.floor(i / itemsPerBraidBlock);
        const indexInBlock = i % itemsPerBraidBlock;
        const rowInBlock = indexInBlock % braidRows;
        const colInBlock = Math.floor(indexInBlock / braidRows);
        const finalRow = (blockIndex * braidRows) + rowInBlock;
        const finalCol = colInBlock;

        if (finalRow < totalRows) {
            const cellX = finalCol * cellWidth;
            const cellY = finalRow * cellHeight;
            child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
        }
    });

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Arranges components in a checkerboard pattern.
 * Fills all "black" squares first, then all "white" squares.
 * @private
 */
const _layoutSquareInterlaced = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 5 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);
    let componentIndex = 0;

    const placeComponent = (r: number, c: number) => {
        if (componentIndex >= components.length) return;
        const child = components[componentIndex];
        const cellX = c * cellWidth;
        const cellY = r * cellHeight;
        child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
        componentIndex++;
    };

    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < columns; c++) {
            if ((r + c) % 2 === 0) {
                placeComponent(r, c);
            }
        }
    }

    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < columns; c++) {
            if ((r + c) % 2 !== 0) {
                placeComponent(r, c);
            }
        }
    }

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Arranges components by taking a random walk through unoccupied grid cells.
 * @private
 */
const _layoutSquareRandomWalk = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 5 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    const occupancyGrid = Array(totalRows).fill(null).map(() => Array(columns).fill(false));
    let unoccupiedCells: { r: number, c: number }[] = [];
    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < columns; c++) {
            unoccupiedCells.push({ r, c });
        }
    }

    if (unoccupiedCells.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    let currentPos: any = unoccupiedCells.splice(Math.floor(Math.random() * unoccupiedCells.length), 1)[0];

    for (const child of components) {
        if (!currentPos) break;

        const { r, c } = currentPos;
        const cellX = c * cellWidth;
        const cellY = r * cellHeight;
        child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
        occupancyGrid[r][c] = true;

        const neighbors = [
            { r: r - 1, c: c }, { r: r + 1, c: c }, { r: r, c: c - 1 }, { r: r, c: c + 1 }
        ].filter(n =>
            n.r >= 0 && n.r < totalRows && n.c >= 0 && n.c < columns && !occupancyGrid[n.r][n.c]
        );

        unoccupiedCells = unoccupiedCells.filter(cell => !(cell.r === r && cell.c === c));

        if (neighbors.length > 0) {
            const nextNeighborIndex = Math.floor(Math.random() * neighbors.length);
            currentPos = neighbors[nextNeighborIndex];
            unoccupiedCells = unoccupiedCells.filter(cell => !(cell.r === currentPos.r && cell.c === currentPos.c));
        } else if (unoccupiedCells.length > 0) {
            const nextJumpIndex = Math.floor(Math.random() * unoccupiedCells.length);
            currentPos = unoccupiedCells.splice(nextJumpIndex, 1)[0];
        } else {
            currentPos = null;
        }
    }

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Arranges components along a Hilbert space-filling curve, correctly handling non-power-of-2 grids.
 * @private
 */
const _layoutSquareHilbertCurve = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 4 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);
    const n = Math.pow(2, Math.ceil(Math.log2(Math.max(columns, totalRows))));
    const allPositionsOnCurve: { r: number, c: number }[] = [];

    const d2xy = (d: number) => {
        let rx, ry, s, t = d;
        let x = 0, y = 0;
        for (s = 1; s < n; s *= 2) {
            rx = 1 & (t / 2);
            ry = 1 & (t ^ rx);
            if (ry === 0) {
                if (rx === 1) {
                    x = s - 1 - x;
                    y = s - 1 - y;
                }
                [x, y] = [y, x];
            }
            x += s * rx;
            y += s * ry;
            t /= 4;
        }
        return { r: x, c: y };
    }

    for(let i=0; i < n*n; i++) {
        allPositionsOnCurve.push(d2xy(i));
    }

    let componentIndex = 0;
    for (const pos of allPositionsOnCurve) {
        if (componentIndex >= components.length) {
            break;
        }

        if (pos.r < totalRows && pos.c < columns) {
            const child = components[componentIndex];
            const cellX = pos.c * cellWidth;
            const cellY = pos.r * cellHeight;
            child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);

            componentIndex++;
        }
    }

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * The simple grid layout algorithm.
 * It's fast and stateless, calculating positions based on index. It does not support spanning.
 * This version handles multiple flow directions including corner starts and honeycomb.
 * @private
 */
const _layoutSquareSimple = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const {
        columns = 3,
        flowDirection = "default",
        flowReverse = false,
        lastRowAlign = "start",
        alignItems = 'start',
        justifyItems = 'start',
        honeycombOrientation = 'pointy-top',
        cornerOffset = 0
    } = options as any;

    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    const isHoneycombFlow = flowDirection === 'honeycomb';

    let hexWidth = 0, hexHeight = 0, xStep = 0, yStep = 0;
    if (isHoneycombFlow) {
        if (honeycombOrientation === 'pointy-top') {
            const requiredWidthFromHeight = maxChildHeight * (2 / Math.sqrt(3));
            hexWidth = Math.max(maxChildWidth, requiredWidthFromHeight);
            hexHeight = hexWidth * (Math.sqrt(3) / 2);
            xStep = hexWidth * 0.75 + columnGap;
            yStep = hexHeight + rowGap;
        } else {
            const requiredHeightFromWidth = maxChildWidth * (2 / Math.sqrt(3));
            hexHeight = Math.max(maxChildHeight, requiredHeightFromWidth);
            hexWidth = hexHeight * (Math.sqrt(3) / 2);
            xStep = hexWidth + columnGap;
            yStep = hexHeight * 0.75 + rowGap;
        }
    }

    const gridWidth = columns * cellWidth - columnGap;
    const isColumnFlow = flowDirection.includes('column');
    const isSnakeFlow = flowDirection.includes('snake');
    const startFromBottom = flowDirection.includes('bottom');
    const startFromRight = flowDirection.includes('right');

    let lastRowOffsetX = 0;
    const itemsOnLastRow = components.length % columns || columns;
    if (lastRowAlign !== "start" && !isColumnFlow && !isSnakeFlow && !startFromRight && itemsOnLastRow > 0 && !isHoneycombFlow) {
        const lastRowContentWidth = itemsOnLastRow * cellWidth - columnGap;
        const emptySpace = gridWidth - lastRowContentWidth;
        if (lastRowAlign === "center") lastRowOffsetX = emptySpace / 2;
        else if (lastRowAlign === "end") lastRowOffsetX = emptySpace;
    }

    components.forEach((child, i) => {
        const useFixed = options.sizingMode === 'fixed';
        const childWidth = useFixed ? (options.fixedWidth ?? 0) : child.width;
        const childHeight = useFixed ? (options.fixedHeight ?? 0) : child.height;

        let baseRow: number, baseCol: number;

        if (isColumnFlow) {
            baseCol = Math.floor(i / totalRows);
            baseRow = i % totalRows;
        } else {
            baseRow = Math.floor(i / columns);
            baseCol = i % columns;
        }

        if (isSnakeFlow) {
            if (isColumnFlow) { if (baseCol % 2 !== 0) baseRow = totalRows - 1 - baseRow; }
            else { if (baseRow % 2 !== 0) baseCol = columns - 1 - baseCol; }
        }

        let finalRow = startFromBottom ? totalRows - 1 - baseRow : baseRow;
        let finalCol = startFromRight ? columns - 1 - baseCol : baseCol;

        if (flowReverse && !startFromBottom && !startFromRight) {
            finalRow = totalRows - 1 - baseRow;
        }

        let cellX: number;
        let cellY: number;

        if (isHoneycombFlow) {
            if (honeycombOrientation === 'pointy-top') {
                cellX = finalCol * xStep;
                cellY = finalRow * yStep + (finalCol % 2 === 1 ? yStep / 2 : 0);
            } else {
                cellX = finalCol * xStep + (finalRow % 2 === 1 ? xStep / 2 : 0);
                cellY = finalRow * yStep;
            }
        } else {
            const isLastRow = finalRow === totalRows - 1;
            cellX = (isLastRow && flowDirection === "default" ? lastRowOffsetX : 0) + finalCol * cellWidth;
            cellY = finalRow * cellHeight;
        }

        let childCenterX: number;
        switch (justifyItems) {
            case 'end': childCenterX = cellX + maxChildWidth - childWidth / 2; break;
            case 'center': childCenterX = cellX + maxChildWidth / 2; break;
            case 'start': default: childCenterX = cellX + childWidth / 2; break;
        }
        let childCenterY: number;
        switch (alignItems) {
            case 'end': childCenterY = cellY + maxChildHeight - childHeight / 2; break;
            case 'center': childCenterY = cellY + maxChildHeight / 2; break;
            case 'start': default: childCenterY = cellY + childHeight / 2; break;
        }

        if (cornerOffset !== 0) {
            const isTop = finalRow === 0;
            const isBottom = finalRow === totalRows - 1;
            const isLeft = finalCol === 0;
            const isRight = finalCol === columns - 1;

            if (isTop && isLeft) {
                childCenterX -= cornerOffset;
                childCenterY -= cornerOffset;
            } else if (isTop && isRight) {
                childCenterX += cornerOffset;
                childCenterY -= cornerOffset;
            } else if (isBottom && isLeft) {
                childCenterX -= cornerOffset;
                childCenterY += cornerOffset;
            } else if (isBottom && isRight) {
                childCenterX += cornerOffset;
                childCenterY += cornerOffset;
            }
        }

        child.position.set(childCenterX, childCenterY);
    });

    if (isHoneycombFlow) {
        return _calculateBoundsFromComponents(components, options);
    } else {
        const totalHeight = totalRows * cellHeight - rowGap;
        if (cornerOffset > 0) {
            return { minX: -cornerOffset, minY: -cornerOffset, maxX: gridWidth + cornerOffset, maxY: totalHeight + cornerOffset };
        }
        return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
    }
};

/**
 * Arranges components by first filling the grid's perimeter, then filling the interior.
 * @private
 */
const _layoutSquarePerimeterFirst = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 5 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    const perimeterPositions: { r: number; c: number }[] = [];
    if (totalRows > 0 && columns > 0) {
        for (let c = 0; c < columns; c++) perimeterPositions.push({ r: 0, c });
        for (let r = 1; r < totalRows; r++) perimeterPositions.push({ r, c: columns - 1 });
        if (totalRows > 1) {
            for (let c = columns - 2; c >= 0; c--) perimeterPositions.push({ r: totalRows - 1, c });
        }
        if (columns > 1) {
            for (let r = totalRows - 2; r > 0; r--) perimeterPositions.push({ r, c: 0 });
        }
    }
    const uniquePerimeterPos = perimeterPositions.filter((pos, index, self) =>
        index === self.findIndex(p => p.r === pos.r && p.c === pos.c)
    );

    const perimeterCount = Math.min(uniquePerimeterPos.length, components.length);
    const perimeterComponents = components.slice(0, perimeterCount);
    const interiorComponents = components.slice(perimeterCount);

    perimeterComponents.forEach((child, i) => {
        const pos = uniquePerimeterPos[i];
        const cellX = pos.c * cellWidth;
        const cellY = pos.r * cellHeight;
        child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
    });

    if (interiorComponents.length > 0 && columns > 2 && totalRows > 2) {
        const interiorColumns = columns - 2;
        interiorComponents.forEach((child, i) => {
            const r = Math.floor(i / interiorColumns);
            const c = i % interiorColumns;
            const cellX = (c + 1) * cellWidth;
            const cellY = (r + 1) * cellHeight;
            child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
        });
    }

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Arranges components in a Z-order (Morton order) curve.
 * @private
 */
const _layoutSquareZOrder = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 4 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    const positions: { r: number, c: number }[] = [];
    const gridDim = Math.pow(2, Math.ceil(Math.log2(Math.max(columns, totalRows))));

    const generate = (x: number, y: number, size: number) => {
        if (positions.length >= components.length) return;

        if (size === 1) {
            if (y < totalRows && x < columns) {
                positions.push({ r: y, c: x });
            }
            return;
        }

        const s = size / 2;
        generate(x, y, s);
        generate(x + s, y, s);
        generate(x, y + s, s);
        generate(x + s, y + s, s);
    };

    generate(0, 0, gridDim);

    components.forEach((child, i) => {
        if (i < positions.length) {
            const pos = positions[i];
            const cellX = pos.c * cellWidth;
            const cellY = pos.r * cellHeight;
            child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
        }
    });

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * The advanced grid layout algorithm that supports item spanning (`colSpan`, `rowSpan`).
 * It is stateful and uses an occupancy grid to place items. It is computationally
 * more expensive than the simple version but more powerful.
 * @private
 */
const _layoutSquareWithSpanning = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const {
        columns = 3,
        flowDirection = "default",
        alignItems = 'start',
        justifyItems = 'start',
        cornerOffset = 0
    } = options as any;

    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const occupancyGrid: boolean[][] = [];
    let maxRowUsed = 0;

    type PlacedItem = {
        component: LayoutComponent;
        row: number;
        col: number;
        rowSpan: number;
        colSpan: number;
        childWidth: number;
        childHeight: number;
    };
    const placedItems: PlacedItem[] = [];

    for (const child of components) {
        const useFixed = options.sizingMode === 'fixed';
        const childWidth = useFixed ? (options.fixedWidth ?? 0) : child.width;
        const childHeight = useFixed ? (options.fixedHeight ?? 0) : child.height;

        const colSpan = Math.min(child.colSpan || 1, columns);
        const rowSpan = child.rowSpan || 1;
        let foundPosition = false;
        let searchRow = 0;

        while (!foundPosition) {
            while (occupancyGrid.length <= searchRow + rowSpan - 1) {
                occupancyGrid.push(Array(columns).fill(false));
            }

            const isSnakeRow = flowDirection === "snake" && searchRow % 2 !== 0;
            const startCol = isSnakeRow ? columns - colSpan : 0;
            const endCol = isSnakeRow ? -1 : columns;
            const step = isSnakeRow ? -1 : 1;

            for (let c = startCol; c !== endCol; c += step) {
                let canFit = true;
                for (let r_offset = 0; r_offset < rowSpan; r_offset++) {
                    for (let c_offset = 0; c_offset < colSpan; c_offset++) {
                        if (occupancyGrid[searchRow + r_offset]?.[c + c_offset]) {
                            canFit = false;
                            break;
                        }
                    }
                    if (!canFit) break;
                }

                if (canFit) {
                    for (let r_offset = 0; r_offset < rowSpan; r_offset++) {
                        for (let c_offset = 0; c_offset < colSpan; c_offset++) {
                            occupancyGrid[searchRow + r_offset][c + c_offset] = true;
                        }
                    }

                    placedItems.push({
                        component: child,
                        row: searchRow,
                        col: c,
                        rowSpan,
                        colSpan,
                        childWidth,
                        childHeight
                    });

                    maxRowUsed = Math.max(maxRowUsed, searchRow + rowSpan - 1);
                    foundPosition = true;
                    break;
                }
            }
            if (!foundPosition) {
                searchRow++;
            }
        }
    }

    const totalRows = maxRowUsed + 1;

    for (const item of placedItems) {
        const { component, row, col, rowSpan, colSpan, childWidth, childHeight } = item;

        const spannedWidth = colSpan * cellWidth - columnGap;
        const spannedHeight = rowSpan * cellHeight - rowGap;
        const cellX = col * cellWidth;
        const cellY = row * cellHeight;

        let childCenterX: number;
        switch (justifyItems) {
            case 'end': childCenterX = cellX + spannedWidth - childWidth / 2; break;
            case 'center': childCenterX = cellX + spannedWidth / 2; break;
            case 'start': default: childCenterX = cellX + childWidth / 2; break;
        }

        let childCenterY: number;
        switch (alignItems) {
            case 'end': childCenterY = cellY + spannedHeight - childHeight / 2; break;
            case 'center': childCenterY = cellY + spannedHeight / 2; break;
            case 'start': default: childCenterY = cellY + childHeight / 2; break;
        }

        if (cornerOffset !== 0) {
            const isTop = row === 0;
            const isBottom = (row + rowSpan) === totalRows;
            const isLeft = col === 0;
            const isRight = (col + colSpan) === columns;

            if (isTop && isLeft) {
                childCenterX -= cornerOffset;
                childCenterY -= cornerOffset;
            }
            if (isTop && isRight) {
                childCenterX += cornerOffset;
                childCenterY -= cornerOffset;
            }
            if (isBottom && isLeft) {
                childCenterX -= cornerOffset;
                childCenterY += cornerOffset;
            }
            if (isBottom && isRight) {
                childCenterX += cornerOffset;
                childCenterY += cornerOffset;
            }
        }

        component.position.set(childCenterX, childCenterY);
    }

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;

    if (cornerOffset > 0) {
        return {
            minX: -cornerOffset,
            minY: -cornerOffset,
            maxX: gridWidth + cornerOffset,
            maxY: totalHeight + cornerOffset
        };
    }

    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Arranges components in rows, wrapping to new lines when `maxWidth` is exceeded.
 * This layout simulates CSS flexbox with `flex-wrap: wrap`.
 * @private
 * @param {LayoutComponent[]} components - The components to be arranged.
 * @param {LayoutOptions} options - Layout configuration. Uses `maxWidth`, `maxHeight`, `alignItems`, `justifyContent`, `alignContent`, and sizing/spacing options.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutFlexWrap = (components: LayoutComponent[], options: LayoutOptions): Bounds => {
    const {
        maxWidth = 400,
        maxHeight,
        alignItems = 'start',
        justifyContent = 'start',
        alignContent = 'start'
    } = options;
    const columnGap = options.columnGap ?? options.spacing ?? 0;
    const rowGap = options.rowGap ?? options.spacing ?? 0;
    const useFixed = options.sizingMode === "fixed";
    const fixedWidth = options.fixedWidth ?? 0;
    const fixedHeight = options.fixedHeight ?? 0;

    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    interface FlexRow { components: LayoutComponent[]; width: number; height: number; }
    const rows: FlexRow[] = [];
    let currentRow: FlexRow = { components: [], width: 0, height: 0 };
    for (const child of components) {
        const childWidth = useFixed ? fixedWidth : child.width;
        const prospectiveWidth = currentRow.width === 0 ? childWidth : currentRow.width + columnGap + childWidth;

        if (prospectiveWidth > maxWidth && currentRow.components.length > 0) {
            rows.push(currentRow);
            currentRow = { components: [], width: 0, height: 0 };
        }
        currentRow.components.push(child);
        currentRow.width = currentRow.width === 0 ? childWidth : currentRow.width + columnGap + childWidth;
    }
    if (currentRow.components.length > 0) rows.push(currentRow);

    let totalContentHeight = 0;
    rows.forEach(row => {
        let rowMaxHeight = 0;
        row.components.forEach(child => {
            const childHeight = useFixed ? fixedHeight : child.height;
            if (childHeight > rowMaxHeight) rowMaxHeight = childHeight;
        });
        row.height = rowMaxHeight;
        totalContentHeight += rowMaxHeight;
    });
    totalContentHeight += (rows.length - 1) * rowGap;

    let yOffset = 0;
    let extraRowGap = 0;
    const remainingHeight = maxHeight && maxHeight > totalContentHeight ? maxHeight - totalContentHeight : 0;
    if (remainingHeight > 0) {
        switch (alignContent) {
            case 'center': yOffset = remainingHeight / 2; break;
            case 'end': yOffset = remainingHeight; break;
            case 'space-between':
                if (rows.length > 1) extraRowGap = remainingHeight / (rows.length - 1);
                break;
            case 'space-around':
                const space = remainingHeight / rows.length;
                yOffset = space / 2;
                extraRowGap = space;
                break;
            case 'stretch':
                const stretchAmount = remainingHeight / rows.length;
                rows.forEach(row => row.height += stretchAmount);
                break;
        }
    }

    let currentY = yOffset;
    for (const row of rows) {
        let offsetX = 0;
        let effectiveGap = columnGap;
        const remainingSpace = maxWidth - row.width;
        const numItems = row.components.length;

        if (remainingSpace > 0) {
            switch (justifyContent) {
                case 'center': offsetX = remainingSpace / 2; break;
                case 'end': offsetX = remainingSpace; break;
                case 'space-between':
                    if (numItems > 1) effectiveGap += remainingSpace / (numItems - 1);
                    break;
                case 'space-around':
                    const space = remainingSpace / numItems;
                    offsetX = space / 2;
                    effectiveGap += space;
                    break;
            }
        }

        let currentX = offsetX;
        for (const child of row.components) {
            const childWidth = useFixed ? fixedWidth : child.width;
            let childCenterY: number;
            switch(alignItems) {
                case 'end': childCenterY = currentY + row.height - child.height / 2; break;
                case 'center': childCenterY = currentY + row.height / 2; break;
                case 'start': default: childCenterY = currentY + child.height / 2; break;
            }
            child.position.set(currentX + childWidth / 2, childCenterY);
            currentX += childWidth + effectiveGap;
        }
        currentY += row.height + rowGap + extraRowGap;
    }

    const finalHeight = maxHeight ? maxHeight : (currentY > yOffset ? currentY - rowGap - extraRowGap : 0);
    return { minX: 0, minY: 0, maxX: maxWidth, maxY: finalHeight };
};

/**
 * A helper to calculate grid cell dimensions based on component sizes and layout options.
 * It supports both 'auto' sizing (based on the largest component) and 'fixed' sizing.
 * @private
 * @param {LayoutComponent[]} components - The components, used to find max dimensions for auto-sizing.
 * @param {LayoutOptions} options - Layout config. Uses `sizingMode`, `fixedWidth`, `fixedHeight`, `columnGap`, `rowGap`, and `spacing`.
 * @returns {{maxChildWidth: number, maxChildHeight: number, cellWidth: number, cellHeight: number, columnGap: number, rowGap: number}} An object with calculated cell dimensions and gap values.
 */
const _calculateGridCellSize = (components: LayoutComponent[], options: LayoutOptions) => {
    const columnGap = options.columnGap ?? options.spacing ?? 0;
    const rowGap = options.rowGap ?? options.spacing ?? 0;

    if (options.sizingMode === "fixed" && options.fixedWidth && options.fixedHeight) {
        return {
            maxChildWidth: options.fixedWidth,
            maxChildHeight: options.fixedHeight,
            cellWidth: options.fixedWidth + columnGap,
            cellHeight: options.fixedHeight + rowGap,
            columnGap,
            rowGap,
        };
    }

    let maxChildWidth = 0;
    let maxChildHeight = 0;
    for (const child of components) {
        if (child.width > maxChildWidth) maxChildWidth = child.width;
        if (child.height > maxChildHeight) maxChildHeight = child.height;
    }

    return {
        maxChildWidth,
        maxChildHeight,
        cellWidth: maxChildWidth + columnGap,
        cellHeight: maxChildHeight + rowGap,
        columnGap,
        rowGap,
    };
};

/**
 * Arranges components evenly along the outer edge (perimeter) of a defined grid.
 * Supports "Exclude Corners" to create a cross-like or edge-only arrangement.
 *
 * @private
 * @param {LayoutComponent[]} components - The components to be arranged.
 * @param {LayoutOptions} options - Layout configuration.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutPerimeterGrid = (components: LayoutComponent[], options: LayoutOptions): Bounds => {
    const {
        columns = 4,
        rows = 3,
        autoRows = false,
        startCorner = 'top-left',
        direction = 'clockwise',
        distribution = 'even',
        cornerSortBy = null,
        sortDirection = 'desc',
        offset = 0,
        rotation = 'none',
        cornerOffset = 0,
        globalRotation = 0,
        perspectiveY = 1,
        depthScale = 0,
        enableZIndex = false,
        excludeCorners = false
    } = options as any;

    const prioritizeCorners = options.prioritizeCorners || !!cornerSortBy;
    let stableComponents = components;
    if (enableZIndex && !cornerSortBy) {
        stableComponents = [...components].sort((a: any, b: any) => {
            return (a.layoutId || 0) - (b.layoutId || 0);
        });
    }

    const numComponents = stableComponents.length;
    if (numComponents === 0 || columns <= 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let effectiveRows = rows;
    if (autoRows) {
        if (excludeCorners) {
            const colTerm = Math.max(2, columns);
            effectiveRows = Math.ceil((numComponents - 2 * colTerm + 8) / 2);
            effectiveRows = Math.max(2, effectiveRows);
        } else {
            if (columns === 1) {
                effectiveRows = numComponents;
            } else if (numComponents <= columns) {
                effectiveRows = 1;
            } else {
                effectiveRows = Math.ceil((numComponents - 2 * columns + 4) / 2);
                effectiveRows = Math.max(2, effectiveRows);
            }
        }
    }

    if (effectiveRows <= 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight } = _calculateGridCellSize(stableComponents, options);

    const topPath = Array.from({ length: columns }, (_, i) => ({ r: 0, c: i }));
    const rightPath = Array.from({ length: effectiveRows - 1 }, (_, i) => ({ r: i + 1, c: columns - 1 }));
    const bottomPath = Array.from({ length: columns - 1 }, (_, i) => ({ r: effectiveRows - 1, c: columns - 2 - i }));
    const leftPath = Array.from({ length: effectiveRows - 2 }, (_, i) => ({ r: effectiveRows - 2 - i, c: 0 }));

    let canonicalPath = [...topPath, ...rightPath, ...bottomPath, ...leftPath];

    if (canonicalPath.length > 1 && canonicalPath[0].r === canonicalPath[canonicalPath.length - 1].r && canonicalPath[0].c === canonicalPath[canonicalPath.length - 1].c) {
        canonicalPath.pop();
    }

    if (excludeCorners) {
        canonicalPath = canonicalPath.filter(slot => {
            const isTopLeft = slot.r === 0 && slot.c === 0;
            const isTopRight = slot.r === 0 && slot.c === columns - 1;
            const isBottomRight = slot.r === effectiveRows - 1 && slot.c === columns - 1;
            const isBottomLeft = slot.r === effectiveRows - 1 && slot.c === 0;
            return !(isTopLeft || isTopRight || isBottomRight || isBottomLeft);
        });
    }

    if (canonicalPath.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    let startIndex = 0;
    if (startCorner === 'top-right') startIndex = canonicalPath.findIndex(p => p.r === 0 && p.c === columns - 1);
    else if (startCorner === 'bottom-right') startIndex = canonicalPath.findIndex(p => p.r === effectiveRows - 1 && p.c === columns - 1);
    else if (startCorner === 'bottom-left') startIndex = canonicalPath.findIndex(p => p.r === effectiveRows - 1 && p.c === 0);
    startIndex = Math.max(0, startIndex);

    let perimeterSlots = [...canonicalPath.slice(startIndex), ...canonicalPath.slice(0, startIndex)];
    if (direction === 'counter-clockwise') {
        const first = perimeterSlots.shift();
        perimeterSlots.reverse();
        if (first) perimeterSlots.unshift(first);
    }

    const gridWidth = (columns - 1) * cellWidth + maxChildWidth;
    const gridHeight = (effectiveRows - 1) * cellHeight + maxChildHeight;
    const centerX = gridWidth / 2 - maxChildWidth / 2;
    const centerY = gridHeight / 2 - maxChildHeight / 2;

    const toRad = (deg: number) => deg * (Math.PI / 180);
    const globalRotRad = toRad(globalRotation);
    const cosRot = Math.cos(globalRotRad);
    const sinRot = Math.sin(globalRotRad);

    const placeChild = (child: LayoutComponent, slot: { r: number, c: number }) => {
        let x = slot.c * cellWidth + maxChildWidth / 2;
        let y = slot.r * cellHeight + maxChildHeight / 2;

        if (cornerOffset !== 0) {
            const isTop = slot.r === 0;
            const isBottom = slot.r === effectiveRows - 1;
            const isLeft = slot.c === 0;
            const isRight = slot.c === columns - 1;
            if (isTop && isLeft) { x -= cornerOffset; y -= cornerOffset; }
            else if (isTop && isRight) { x += cornerOffset; y -= cornerOffset; }
            else if (isBottom && isRight) { x += cornerOffset; y += cornerOffset; }
            else if (isBottom && isLeft) { x -= cornerOffset; y += cornerOffset; }
        }

        let dx = x - centerX;
        let dy = y - centerY;

        if (offset !== 0) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                dx += (dx / dist) * offset;
                dy += (dy / dist) * offset;
            }
        }

        const rotX = dx * cosRot - dy * sinRot;
        const rotY = dx * sinRot + dy * cosRot;
        const finalX = rotX;
        const finalY = rotY * perspectiveY;

        child.position.set(finalX, finalY);

        const maxExtent = Math.max(gridWidth, gridHeight) / 2 || 1;
        const depthFactor = rotY / maxExtent;

        if (depthScale !== 0 && (child as any).scale) {
            const s = 1 + (depthFactor * depthScale);
            (child as any).scale.set(Math.max(0.1, s));
        }
        if (enableZIndex && (child as any).zIndex !== undefined) {
            (child as any).zIndex = Math.floor(depthFactor * 1000);
        }
        if (typeof child.rotation !== 'undefined') {
            if (rotation !== 'none') {
                const angle = Math.atan2(rotY, rotX);
                child.rotation = angle + (rotation === 'face-outward' ? Math.PI / 2 : -Math.PI / 2);
            } else {
                child.rotation = 0;
            }
        }
    };

    const placedComponentSet = new Set<LayoutComponent>();
    const usedSlotSet = new Set<string>();

    if (!excludeCorners && prioritizeCorners && columns > 1 && effectiveRows > 1) {
        const cornerSlots = [
            { r: 0, c: 0 },
            { r: 0, c: columns - 1 },
            { r: effectiveRows - 1, c: columns - 1 },
            { r: effectiveRows - 1, c: 0 },
        ].slice(0, numComponents);

        let componentsToPlaceInCorners = [...stableComponents];
        if (cornerSortBy) {
            const sortFn = typeof cornerSortBy === 'function'
                ? cornerSortBy
                : (a: any, b: any) => (a[cornerSortBy] || 0) - (b[cornerSortBy] || 0);
            componentsToPlaceInCorners.sort(sortFn);
            if (sortDirection === 'desc') componentsToPlaceInCorners.reverse();
        }

        cornerSlots.forEach((cornerSlot, i) => {
            if (i >= componentsToPlaceInCorners.length) return;
            const component = componentsToPlaceInCorners[i];
            placeChild(component, cornerSlot);
            placedComponentSet.add(component);
            usedSlotSet.add(`${cornerSlot.r},${cornerSlot.c}`);
        });
    }

    const componentsForDistribution = stableComponents.filter(c => !placedComponentSet.has(c));
    const slotsForDistribution = perimeterSlots.filter(s => !usedSlotSet.has(`${s.r},${s.c}`));

    const numRemainingSlots = slotsForDistribution.length;
    const numRemainingComponents = componentsForDistribution.length;

    if (numRemainingComponents > 0 && numRemainingSlots > 0) {
        componentsForDistribution.forEach((child, i) => {
            let slotIndex = distribution === 'packed'
                ? i
                : Math.floor(i * (numRemainingSlots / numRemainingComponents));

            if (slotIndex < numRemainingSlots) {
                placeChild(child, slotsForDistribution[slotIndex]);
            }
        });
    }

    return _calculateBoundsFromComponents(stableComponents, options);
};

/**
 * Arranges components in an Archimedean spiral.
 * @private
 * @param {LayoutComponent[]} components - The components to be arranged.
 * @param {LayoutOptions} [options={}] - Layout configuration. Uses `separation` to control distance between arms and `tightness` for expansion speed.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutSpiral = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const separation = options.separation || 50;
    const tightness = options.tightness || 0.5;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    let angle = 0;
    components.forEach(child => {
        const radius = separation * angle;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        child.position.set(x, y);
        angle += tightness;
    });

    return _calculateBoundsFromComponents(components, options);
};

/**
 * Arranges components along a sine wave.
 * @private
 * @param {LayoutComponent[]} components - The components to be arranged.
 * @param {LayoutOptions} [options={}] - Layout configuration. Uses `amplitude`, `frequency`, `spacing`, and sizing options.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutWave = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const amplitude = options.amplitude || 50;
    const frequency = options.frequency || 0.1;
    const spacing = options.spacing || 10;
    const useFixed = options.sizingMode === "fixed";
    const fixedWidth = options.fixedWidth ?? 0;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    let currentX = 0;
    let minY = Infinity, maxY = -Infinity;

    for (const child of components) {
        const childWidth = useFixed ? fixedWidth : child.width;
        const y = amplitude * Math.sin(currentX * frequency);
        child.position.set(currentX + childWidth / 2, y);

        minY = Math.min(minY, y - child.height / 2);
        maxY = Math.max(maxY, y + child.height / 2);

        currentX += childWidth + spacing;
    }

    const totalWidth = currentX > 0 ? currentX - spacing : 0;
    return { minX: 0, minY: minY, maxX: totalWidth, maxY: maxY };
};

/**
 Arranges components in a masonry (Pinterest-style) layout.
 Columns have a fixed width, but rows have variable heights, creating a tightly packed layout.
 @private
 @param {LayoutComponent[]} components - The components to arrange.
 @param {LayoutOptions} options - Layout config. Uses columns, columnGap, rowGap, and sizing options.
 @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutMasonry = (components: LayoutComponent[], options: LayoutOptions): Bounds => {
    const { columns = 3 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const { cellWidth, maxChildWidth, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const useFixed = options.sizingMode === "fixed";
    const fixedHeight = options.fixedHeight ?? 0;
    const columnHeights = Array(columns).fill(0);
    for (const child of components) {
        let shortestColumnIndex = 0;
        for (let i = 1; i < columns; i++) {
            if (columnHeights[i] < columnHeights[shortestColumnIndex]) {
                shortestColumnIndex = i;
            }
        }
        const childHeight = useFixed ? fixedHeight : child.height;
        const x = shortestColumnIndex * cellWidth + maxChildWidth / 2;
        const y = columnHeights[shortestColumnIndex] + childHeight / 2;
        child.position.set(x, y);

        columnHeights[shortestColumnIndex] += childHeight + rowGap;
    }
    const totalWidth = columns * cellWidth - columnGap;
    const totalHeight = Math.max(...columnHeights) - rowGap;
    return { minX: 0, minY: 0, maxX: totalWidth, maxY: totalHeight };
};

/**
 Arranges components in a spiral pattern inspired by phyllotaxis (e.g., sunflower seeds).
 Items are distributed evenly from the center outwards using the golden angle.
 @private
 @param {LayoutComponent[]} components - The components to be arranged.
 @param {LayoutOptions} [options={}] - Layout configuration. Uses spacing to control the distance between items.
 @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutPhyllotaxis = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const spacing = options.spacing || 5;
    const angle = 137.5 * (Math.PI / 180);
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    components.forEach((child, i) => {
        const radius = spacing * Math.sqrt(i);
        const theta = i * angle;
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);
        child.position.set(x, y);
    });
    return _calculateBoundsFromComponents(components, options);
};

/**
 Arranges components along a given SVG path string.
 Requires a pathParser utility to be passed in options to keep the library dependency-free.
 @private
 @param {LayoutComponent[]} components - The components to be arranged.
 @param {LayoutOptions} [options={}] - Layout configuration. Uses path, pathParser, rotateToPath.
 @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutPath = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { path, pathParser, rotateToPath = false } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    if (!pathParser || !path) {
        console.warn('Path layout requires both a path string and a pathParser utility in options.');
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    try {
        const properties = new pathParser(path);
        const totalLength = properties.getTotalLength();
        if (totalLength === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        const divisor = components.length > 1 ? components.length - 1 : 1;

        components.forEach((child, i) => {
            const distance = (i / divisor) * totalLength;
            const point = properties.getPointAtLength(distance);
            child.position.set(point.x, point.y);

            if (rotateToPath && typeof child.rotation !== 'undefined') {
                const tangent = properties.getTangentAtLength(distance);
                child.rotation = Math.atan2(tangent.y, tangent.x);
            } else if (typeof child.rotation !== 'undefined') {
                child.rotation = 0;
            }
        });
    } catch (e) {
        console.error('Error using the provided pathParser:', e);
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    return _calculateBoundsFromComponents(components, options);
};

/**
 * Arranges and scales components to create an illusion of 3D depth receding to a vanishing point.
 * @private
 * @param {LayoutComponent[]} components - The components to arrange.
 * @param {LayoutOptions} [options={}] - Layout config. Uses `columns`, `vanishingPoint`, `depthSpacing`, and `scale`.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutPerspective = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const {
        columns = 5,
        vanishingPoint = { x: 0, y: 0 },
        depthSpacing = 0.8,
        scale = 0.5
    } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);
    const gridWidth = columns * cellWidth;
    const gridHeight = totalRows * cellHeight;

    components.forEach((child, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);

        const initialX = (col * cellWidth + cellWidth / 2 - gridWidth / 2) * scale;
        const initialY = (row * cellHeight + cellHeight / 2 - gridHeight / 2) * scale;

        const depthFactor = Math.pow(depthSpacing, row);

        const finalX = vanishingPoint.x + (initialX - vanishingPoint.x) * depthFactor;
        const finalY = vanishingPoint.y + (initialY - vanishingPoint.y) * depthFactor;

        child.position.set(finalX, finalY);
        if (child.scale) {
            child.scale.set(depthFactor * scale, depthFactor * scale);
        }
    });

    return _calculateBoundsFromComponents(components, options);
};

/**
 * Arranges components in an isometric grid, creating a 2.5D projection.
 * @private
 * @param {LayoutComponent[]} components - The components to arrange.
 * @param {LayoutOptions} [options={}] - Layout config. Uses `columns`, `tileWidth`, and `tileHeight`.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutIsometric = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 5, tileWidth = 80, tileHeight = 40 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    components.forEach((child, i) => {
        const gridX = i % columns;
        const gridY = Math.floor(i / columns);

        const screenX = (gridX - gridY) * (tileWidth / 2);
        const screenY = (gridX + gridY) * (tileHeight / 2);

        child.position.set(screenX, screenY);
    });

    return _calculateBoundsFromComponents(components, options);
};

/**
 * Arranges components in a space-filling treemap layout based on their `value`.
 * @private
 */
const _layoutTreemap = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { width = 500, height = 500 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: width, maxY: height };

    const totalValue = components.reduce((sum, c) => sum + (c.value || 1), 0);
    const nodes = components.map(c => ({
        component: c,
        normalizedValue: (c.value || 1) / totalValue,
    })).sort((a, b) => b.normalizedValue - a.normalizedValue);

    const squarify = (nodes: any[], rect: { x: number, y: number, w: number, h: number }) => {
        if (nodes.length === 0) return;

        const totalValue = nodes.reduce((sum, n) => sum + n.normalizedValue, 0);
        let i = 1;
        while (i < nodes.length) {
            const row = nodes.slice(0, i);
            const nextRow = nodes.slice(0, i + 1);
            if (worstAspectRatio(row, rect, totalValue) < worstAspectRatio(nextRow, rect, totalValue)) {
                break;
            }
            i++;
        }

        const currentNodes = nodes.slice(0, i);
        const remainingNodes = nodes.slice(i);
        const currentTotalValue = currentNodes.reduce((sum, n) => sum + n.normalizedValue, 0);
        const areaRatio = currentTotalValue / totalValue;

        let newRect;
        if (rect.w > rect.h) {
            const rowWidth = rect.w * areaRatio;
            layoutRow(currentNodes, { ...rect, w: rowWidth }, currentTotalValue);
            newRect = { x: rect.x + rowWidth, y: rect.y, w: rect.w - rowWidth, h: rect.h };
        } else {
            const rowHeight = rect.h * areaRatio;
            layoutRow(currentNodes, { ...rect, h: rowHeight }, currentTotalValue);
            newRect = { x: rect.x, y: rect.y + rowHeight, w: rect.w, h: rect.h - rowHeight };
        }
        squarify(remainingNodes, newRect);
    };

    const layoutRow = (nodes: any[], rect: { x: number, y: number, w: number, h: number }, total: number) => {
        let pos = 0;
        nodes.forEach(node => {
            const ratio = node.normalizedValue / total;
            if (rect.w > rect.h) {
                const w = rect.w;
                const h = rect.h * ratio;
                node.component.position.set(rect.x + w / 2, rect.y + pos + h / 2);
                node.component.width = w;
                node.component.height = h;
                pos += h;
            } else {
                const w = rect.w * ratio;
                const h = rect.h;
                node.component.position.set(rect.x + pos + w / 2, rect.y + h / 2);
                node.component.width = w;
                node.component.height = h;
                pos += w;
            }
        });
    };

    const worstAspectRatio = (nodes: any[], rect: { w: number, h: number }, total: number) => {
        const sum = nodes.reduce((s, n) => s + n.normalizedValue, 0);
        const area = sum / total * rect.w * rect.h;
        const shortSide = Math.min(rect.w, rect.h);
        const length = area / shortSide;
        let maxRatio = 0;
        nodes.forEach(n => {
            const nodeArea = n.normalizedValue / sum * area;
            maxRatio = Math.max(maxRatio, length / (nodeArea / length), (nodeArea / length) / length);
        });
        return maxRatio;
    };

    squarify(nodes, { x: 0, y: 0, w: width, h: height });
    return { minX: 0, minY: 0, maxX: width, maxY: height };
};

/**
 * Arranges components into a tightly packed cluster of circles using a simple physics simulation.
 * @private
 */
const _layoutBubble = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const {
        iterations = 100,
        centerStrength = 0.01,
        radiusScale = 5,
        padding = 2
    } = options;

    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const nodes = components.map(c => ({
        component: c,
        radius: (Math.sqrt(c.value || 10) * radiusScale),
        x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10,
        vx: 0, vy: 0,
    }));

    for (let i = 0; i < iterations; i++) {
        for (const nodeA of nodes) {
            nodeA.vx += -nodeA.x * centerStrength;
            nodeA.vy += -nodeA.y * centerStrength;

            for (const nodeB of nodes) {
                if (nodeA === nodeB) continue;
                const dx = nodeB.x - nodeA.x;
                const dy = nodeB.y - nodeA.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const minDist = nodeA.radius + nodeB.radius + padding;

                if (dist < minDist) {
                    const angle = Math.atan2(dy, dx);
                    const tx = nodeA.x + Math.cos(angle) * minDist;
                    const ty = nodeA.y + Math.sin(angle) * minDist;
                    const ax = (tx - nodeB.x) * 0.5;
                    const ay = (ty - nodeB.y) * 0.5;
                    nodeA.vx -= ax; nodeA.vy -= ay;
                    nodeB.vx += ax; nodeB.vy += ay;
                }
            }
        }
        for (const node of nodes) {
            node.x += node.vx; node.y += node.vy;
            node.vx *= 0.9; node.vy *= 0.9;
        }
    }

    nodes.forEach(n => {
        n.component.position.set(n.x, n.y);
        n.component.width = n.radius * 2;
        n.component.height = n.radius * 2;
    });

    return _calculateBoundsFromComponents(components, options);
};

/**
 * Arranges components based on a Voronoi tessellation. Requires a user-provided parser.
 * @private
 */
const _layoutVoronoi = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const {
        voronoiParser,
        width = 500,
        height = 500,
        iterations = 3
    } = options;

    if (!voronoiParser || components.length === 0) {
        return { minX: 0, minY: 0, maxX: width, maxY: height };
    }

    try {
        let points = components.map(() => [
            Math.random() * width,
            Math.random() * height
        ]);

        for (let i = 0; i < iterations; i++) {
            const delaunay = new voronoiParser(points.flat());
            const voronoi = delaunay.voronoi([0, 0, width, height]);

            const newPoints = [];

            for (let j = 0; j < components.length; j++) {
                const cell = voronoi.cellPolygon(j);
                if (cell && cell.length > 0) {
                    let sumX = 0, sumY = 0;
                    cell.forEach((p: any) => {
                        sumX += p[0];
                        sumY += p[1];
                    });
                    newPoints.push([sumX / cell.length, sumY / cell.length]);
                } else {
                    newPoints.push(points[j]);
                }
            }
            points = newPoints;
        }

        components.forEach((child, i) => {
            child.position.set(points[i][0], points[i][1]);
        });

    } catch(e) {
        console.error('Error using the provided voronoiParser:', e);
    }

    return { minX: 0, minY: 0, maxX: width, maxY: height };
};

/**
 * Arranges components in a word cloud pattern, placing larger items near the center.
 * @private
 */
const _layoutWordCloud = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { spiralTightness = 0.2, iterations = 200 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const sorted = [...components].sort((a, b) => (b.value || 1) - (a.value || 1));
    const placed: LayoutComponent[] = [];

    sorted.forEach((child, i) => {
        if (i === 0) {
            child.position.set(0, 0);
            placed.push(child);
            return;
        }

        let angle = Math.random() * Math.PI * 2;
        let radius = 0;
        let found = false;

        for(let k = 0; k < iterations && !found; k++) {
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            child.position.set(x, y);

            let collides = false;
            for (const other of placed) {
                const dx = other.position.x - child.position.x;
                const dy = other.position.y - child.position.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < (Math.max(other.width, other.height) / 2 + Math.max(child.width, child.height) / 2)) {
                    collides = true;
                    break;
                }
            }

            if (!collides) {
                found = true;
            } else {
                angle += spiralTightness;
                radius = spiralTightness * angle;
            }
        }
        placed.push(child);
    });

    return _calculateBoundsFromComponents(placed, options);
};

/**
 * Arranges components as tightly packed circles inside a bounding circle.
 * The radius of each component is determined by its `value` property.
 * This is an iterative, physics-based layout that resolves collisions.
 * @private
 * @param {LayoutComponent[]} components - The components to arrange. Each needs a `value` property.
 * @param {LayoutOptions} [options={}] - Layout config. Uses `boundsRadius`, `padding`, `iterations`, `passes`, `centerStrength`, `radiusScale`.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutCirclePack = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const {
        iterations = 100,
        passes = 2,
        centerStrength = 0.01,
        boundsRadius = 300,
        padding = 2,
        radiusScale = 2,
    } = options;

    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const nodes = components.map(c => ({
        component: c,
        radius: Math.sqrt(c.value || 1) * radiusScale,
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
    }));

    nodes.sort((a, b) => b.radius - a.radius);

    for (let i = 0; i < iterations; i++) {
        for (const node of nodes) {
            node.x += -node.x * centerStrength;
            node.y += -node.y * centerStrength;
        }

        for (let p = 0; p < passes; p++) {
            for (let j = 0; j < nodes.length; j++) {
                const nodeA = nodes[j];
                for (let k = j + 1; k < nodes.length; k++) {
                    const nodeB = nodes[k];

                    const dx = nodeB.x - nodeA.x;
                    const dy = nodeB.y - nodeA.y;
                    const distSq = dx * dx + dy * dy;
                    const minRadius = nodeA.radius + nodeB.radius + padding;

                    if (distSq < minRadius * minRadius) {
                        const dist = Math.sqrt(distSq) || 1;
                        const overlap = minRadius - dist;
                        const separationX = (dx / dist) * overlap * 0.5;
                        const separationY = (dy / dist) * overlap * 0.5;

                        nodeA.x -= separationX;
                        nodeA.y -= separationY;
                        nodeB.x += separationX;
                        nodeB.y += separationY;
                    }
                }
            }
        }

        for (const node of nodes) {
            const distFromCenter = Math.sqrt(node.x * node.x + node.y * node.y);
            const maxAllowedDist = boundsRadius - node.radius;

            if (distFromCenter > maxAllowedDist) {
                const ratio = maxAllowedDist / distFromCenter;
                node.x *= ratio;
                node.y *= ratio;
            }
        }
    }

    nodes.forEach(n => {
        n.component.position.set(n.x, n.y);
        n.component.width = n.radius * 2;
        n.component.height = n.radius * 2;
    });

    return _calculateBoundsFromComponents(components, options);
};

/**
 * Arranges components in a "fanned out" arc, simulating a hand of cards.
 * This layout is an arc where each component is also rotated to point outwards
 * from the circle's center, creating a natural fan effect.
 * @private
 * @param {LayoutComponent[]} components - The components to arrange. Their rotation property will be modified.
 * @param {LayoutOptions} [options={}] - Layout config. Uses `arcRadius`, `arcAngle`.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutCardHand = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const {
        arcRadius = 300,
        arcAngle = 45,
    } = options;

    const total = components.length;
    if (total === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const toRad = (deg: number): number => deg * (Math.PI / 180);
    const totalAngleRad = toRad(arcAngle);

    const centerAngle = -Math.PI / 2;
    const startAngleRad = centerAngle - totalAngleRad / 2;

    const divisor = total > 1 ? total - 1 : 1;
    const angleStep = totalAngleRad / divisor;

    components.forEach((child, i) => {
        let angle: number;

        if (total === 1) {
            angle = centerAngle;
        } else {
            angle = startAngleRad + i * angleStep;
        }

        const x = arcRadius * Math.cos(angle);
        const y = arcRadius * Math.sin(angle);

        child.position.set(x, y);

        if (typeof child.rotation !== 'undefined') {
            child.rotation = angle + Math.PI / 2;
        }
    });

    return _calculateBoundsFromComponents(components, options);
};

/**
 * Places all components at nearly the same position with a slight offset,
 * creating the illusion of a deck of cards or a pile of chips.
 * @private
 * @param {LayoutComponent[]} components - The components to arrange.
 * @param {LayoutOptions} [options={}] - Layout config. Uses `offsetX`, `offsetY`, and `offsetRotation`.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutStack = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const {
        offsetX = 0.5,
        offsetY = 0.5,
        offsetRotation = 0,
    } = options;

    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const toRad = (deg: number): number => deg * (Math.PI / 180);

    components.forEach((child, i) => {
        const x = i * offsetX;
        const y = i * offsetY;
        child.position.set(x, y);

        if (offsetRotation !== 0 && typeof child.rotation !== 'undefined') {
            child.rotation = i * toRad(offsetRotation);
        } else if (typeof child.rotation !== 'undefined') {
            child.rotation = 0;
        }
    });

    return _calculateBoundsFromComponents(components, options);
};

/**
 * Places components within predefined rectangular zones based on a `zoneName` property.
 * Can apply a sub-layout (e.g., 'square') within each zone.
 * @private
 * @param {LayoutComponent[]} components - The components to arrange. Each should have a `zoneName`.
 * @param {LayoutOptions} [options={}] - Layout config. Requires `zones` array. Can use `zoneLayout`.
 * @returns {Bounds} The calculated bounds encompassing all defined zones.
 */
const _layoutPayoutZones = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { zones = [], zoneLayout } = options;
    if (components.length === 0 || zones.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const componentsByZone = new Map<string, LayoutComponent[]>();
    for (const component of components) {
        if (component.zoneName) {
            if (!componentsByZone.has(component.zoneName)) {
                componentsByZone.set(component.zoneName, []);
            }
            componentsByZone.get(component.zoneName)!.push(component);
        }
    }

    const subLayouts: Record<string, (c: LayoutComponent[], o: LayoutOptions) => Bounds> = {
        [layoutEnum.SQUARE]: _layoutSquareSimple,
        [layoutEnum.BUBBLE]: _layoutBubble,
        [layoutEnum.PHYLLOTAXIS]: _layoutPhyllotaxis,
    };

    for (const zone of zones) {
        const zoneComponents = componentsByZone.get(zone.name);
        if (!zoneComponents || zoneComponents.length === 0) continue;

        if (zoneLayout && subLayouts[zoneLayout]) {
            const subLayoutFunc = subLayouts[zoneLayout];
            const subBounds = subLayoutFunc(zoneComponents, options);
            const subLayoutCenterX = subBounds.minX + (subBounds.maxX - subBounds.minX) / 2;
            const subLayoutCenterY = subBounds.minY + (subBounds.maxY - subBounds.minY) / 2;
            const zoneCenterX = zone.bounds.x + zone.bounds.width / 2;
            const zoneCenterY = zone.bounds.y + zone.bounds.height / 2;
            const offsetX = zoneCenterX - subLayoutCenterX;
            const offsetY = zoneCenterY - subLayoutCenterY;

            for (const component of zoneComponents) {
                component.position.x += offsetX;
                component.position.y += offsetY;
            }
        } else {
            for (const component of zoneComponents) {
                const x = zone.bounds.x + component.width / 2 + Math.random() * (zone.bounds.width - component.width);
                const y = zone.bounds.y + component.height / 2 + Math.random() * (zone.bounds.height - component.height);
                component.position.set(x, y);
            }
        }
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const zone of zones) {
        minX = Math.min(minX, zone.bounds.x);
        minY = Math.min(minY, zone.bounds.y);
        maxX = Math.max(maxX, zone.bounds.x + zone.bounds.width);
        maxY = Math.max(maxY, zone.bounds.y + zone.bounds.height);
    }

    return { minX, minY, maxX, maxY };
};

/**
 * Scatters components outwards from a central point in a visually exciting, semi-random way.
 * It interpolates between a perfect Phyllotaxis spiral and a random scatter.
 * @private
 * @param {LayoutComponent[]} components - The components to arrange.
 * @param {LayoutOptions} [options={}] - Layout config. Uses `maxRadius`, `spreadFactor`, and `randomness`.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutSpreadExplosion = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const {
        maxRadius = 300,
        spreadFactor = 15,
        randomness = 0.5,
    } = options;

    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    components.forEach((child, i) => {
        const idealRadius = spreadFactor * Math.sqrt(i);
        const idealAngle = i * goldenAngle;
        const idealX = idealRadius * Math.cos(idealAngle);
        const idealY = idealRadius * Math.sin(idealAngle);

        const randomRadius = Math.sqrt(Math.random()) * maxRadius;
        const randomAngle = Math.random() * 2 * Math.PI;
        const randomX = randomRadius * Math.cos(randomAngle);
        const randomY = randomRadius * Math.sin(randomAngle);

        const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
        const finalX = lerp(idealX, randomX, randomness);
        const finalY = lerp(idealY, randomY, randomness);

        child.position.set(finalX, finalY);

        if (typeof child.rotation !== 'undefined') {
            child.rotation = Math.random() * 2 * Math.PI;
        }
    });

    return _calculateBoundsFromComponents(components, options);
};

/**
 * Arranges components in centered, tiered rows, like a pyramid.
 * The number of items per row is defined by the `tiers` array.
 * @private
 * @param {LayoutComponent[]} components - The components to arrange.
 * @param {LayoutOptions} [options={}] - Layout config. Uses `tiers`, `rowGap`, `itemSpacing`, and now `sizingMode`.
 * @returns {Bounds} The calculated bounds of the layout.
 */
const _layoutPyramid = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const {
        tiers = [1, 2, 3],
        rowGap = 10,
        itemSpacing = 10,
        alignment = 'center',
        direction = 'up',
        tierAlignment = 'center',
        staggerOffset = 0,
        sizingMode,
        fixedWidth,
        fixedHeight,
        justifyTierContent = 'center',
        sortBy = null,
        sortDirection = 'asc',
    } = options;

    if (components.length === 0 || tiers.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    const useActualSize = sizingMode !== 'fixed';

    let componentsToLayout = [...components];
    if (sortBy) {
        const sortFn = typeof sortBy === 'function'
            ? sortBy
            : (a: any, b: any) => (a[sortBy] || 0) - (b[sortBy] || 0);
        componentsToLayout.sort(sortFn);
        if (sortDirection === 'desc') {
            componentsToLayout.reverse();
        }
    }

    const isVertical = direction === 'up' || direction === 'down';
    const mainAxis = isVertical ? 'y' : 'x';
    const crossAxis = isVertical ? 'x' : 'y';
    const mainDim = isVertical ? 'height' : 'width';
    const crossDim = isVertical ? 'width' : 'height';
    const mainGap = rowGap;
    const crossGap = itemSpacing;

    let maxItemMain = 0;
    let maxItemCross = 0;

    if (useActualSize) {
        for (const child of componentsToLayout) {
            if (child[mainDim] > maxItemMain) maxItemMain = child[mainDim];
            if (child[crossDim] > maxItemCross) maxItemCross = child[crossDim];
        }
    } else {
        maxItemMain = (isVertical ? fixedHeight : fixedWidth) ?? 0;
        maxItemCross = (isVertical ? fixedWidth : fixedHeight) ?? 0;
    }

    let componentIndex = 0;
    let currentMain = 0;
    const placedComponents: LayoutComponent[] = [];

    const tierWidths = tiers.map(itemsInTier => {
        const count = Math.min(itemsInTier, componentsToLayout.length - (componentIndex + itemsInTier));
        return (count * maxItemCross) + Math.max(0, count - 1) * crossGap;
    });
    const maxTierCross = Math.max(0, ...tierWidths);
    componentIndex = 0;

    const tierOrder = direction === 'down' || direction === 'right' ? [...tiers].reverse() : tiers;

    for (const [tierIndex, itemsInTier] of tierOrder.entries()) {
        if (componentIndex >= componentsToLayout.length) break;

        const tierComponents = componentsToLayout.slice(componentIndex, componentIndex + itemsInTier);
        if (tierComponents.length === 0) continue;

        placedComponents.push(...tierComponents);

        const tierContainerCross = (tierComponents.length * maxItemCross) + Math.max(0, tierComponents.length - 1) * crossGap;
        const actualContentCross = useActualSize
            ? tierComponents.reduce((sum, comp) => sum + comp[crossDim], 0)
            : tierComponents.length * maxItemCross;
        const remainingSpace = (tierContainerCross - (Math.max(0, tierComponents.length - 1) * crossGap)) - actualContentCross;

        let crossOffset = 0;
        if (tierAlignment === 'center') {
            crossOffset = (maxTierCross - tierContainerCross) / 2;
        } else if (tierAlignment === 'right' || tierAlignment === 'end') {
            crossOffset = maxTierCross - tierContainerCross;
        }

        if (staggerOffset !== 0) {
            crossOffset += staggerOffset * tierIndex;
        }

        let currentCross = crossOffset;
        let effectiveCrossGap = crossGap;

        if (tierComponents.length > 0 && remainingSpace > 0.001) {
            switch (justifyTierContent) {
                case 'center':
                    currentCross += remainingSpace / 2;
                    break;
                case 'end':
                    currentCross += remainingSpace;
                    break;
                case 'space-between':
                    if (tierComponents.length > 1) {
                        effectiveCrossGap += remainingSpace / (tierComponents.length - 1);
                    }
                    break;
                case 'space-around':
                    const space = remainingSpace / tierComponents.length;
                    currentCross += space / 2;
                    effectiveCrossGap += space;
                    break;
            }
        }

        for (const component of tierComponents) {
            const itemMain = useActualSize ? component[mainDim] : maxItemMain;
            const itemCross = useActualSize ? component[crossDim] : maxItemCross;

            const pos = { [crossAxis]: 0, [mainAxis]: 0 };
            pos[crossAxis] = currentCross + itemCross / 2;
            pos[mainAxis] = currentMain + itemMain / 2;

            component.position.set(pos.x, pos.y);
            currentCross += itemCross + effectiveCrossGap;
        }

        componentIndex += itemsInTier;
        currentMain += maxItemMain + mainGap;
    }

    let actualMinCross = Infinity;
    let actualMaxCross = -Infinity;
    if (placedComponents.length > 0) {
        for (const component of placedComponents) {
            const itemCrossDim = useActualSize ? component[crossDim] : maxItemCross;
            const pos = component.position[crossAxis];
            actualMinCross = Math.min(actualMinCross, pos - itemCrossDim / 2);
            actualMaxCross = Math.max(actualMaxCross, pos + itemCrossDim / 2);
        }
    } else {
        actualMinCross = 0;
        actualMaxCross = 0;
    }

    const totalMain = currentMain > 0 ? currentMain - mainGap : 0;
    const crossCenter = (actualMinCross + actualMaxCross) / 2;

    let mainOffset = 0;
    if (alignment === 'center') {
        mainOffset = -totalMain / 2;
    } else { // @ts-ignore
        if (alignment === 'bottom' || alignment === 'end') {
            mainOffset = -totalMain;
        }
    }

    for (const component of placedComponents) {
        component.position[mainAxis] += mainOffset;
        component.position[crossAxis] -= crossCenter;
    }

    const finalCrossSize = actualMaxCross - actualMinCross;

    return isVertical
        ? { minX: -finalCrossSize / 2, maxX: finalCrossSize / 2, minY: mainOffset, maxY: mainOffset + totalMain }
        : { minX: mainOffset, maxX: mainOffset + totalMain, minY: -finalCrossSize / 2, maxY: finalCrossSize / 2 };
};

/**
 * Fills the grid with components in a spiral pattern starting from the center of the grid.
 * This version respects the grid's column and row boundaries.
 * @private
 */
const _layoutSquareSpiral = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 5, flowDirection = 'spiral-out' } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    const positions: { r: number, c: number }[] = [];
    const occupancyGrid = Array(totalRows).fill(null).map(() => Array(columns).fill(false));

    let r = Math.floor(totalRows / 2);
    let c = Math.floor(columns / 2);
    let dr = 0, dc = 1;
    let segmentLength = 1, stepsInSegment = 0, turnCounter = 0;

    for (let i = 0; i < components.length; i++) {
        while (r < 0 || r >= totalRows || c < 0 || c >= columns || occupancyGrid[r][c]) {
            r += dr; c += dc;
            stepsInSegment++;
            if (stepsInSegment >= segmentLength) {
                stepsInSegment = 0;
                [dr, dc] = [-dc, dr];
                turnCounter++;
                if (turnCounter % 2 === 0) {
                    segmentLength++;
                }
            }
        }

        positions.push({ r, c });
        occupancyGrid[r][c] = true;

        r += dr; c += dc;
        stepsInSegment++;
        if (stepsInSegment >= segmentLength) {
            stepsInSegment = 0;
            [dr, dc] = [-dc, dr];
            turnCounter++;
            if (turnCounter % 2 === 0) {
                segmentLength++;
            }
        }
    }

    if (flowDirection === 'spiral-in') {
        positions.reverse();
    }

    components.forEach((child, i) => {
        if (i >= positions.length) return;
        const pos = positions[i];
        const cellX = pos.c * cellWidth;
        const cellY = pos.r * cellHeight;
        child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
    });

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Fills the grid in rectangular blocks, moving from one block to the next.
 * This version correctly handles grids where the dimensions are not even multiples of the block size.
 * The size of the blocks is configurable via `blockWidth` and `blockHeight` options.
 * @private
 */
const _layoutSquareBlockFill = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 6 } = options;
    const { blockWidth = 2, blockHeight = 2 } = options as any;
    if (components.length === 0 || blockWidth <= 0 || blockHeight <= 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    let componentIndex = 0;

    const numBlockRows = Math.ceil(totalRows / blockHeight);
    const numBlockCols = Math.ceil(columns / blockWidth);

    for (let br = 0; br < numBlockRows; br++) {
        for (let bc = 0; bc < numBlockCols; bc++) {
            for (let rInBlock = 0; rInBlock < blockHeight; rInBlock++) {
                for (let cInBlock = 0; cInBlock < blockWidth; cInBlock++) {
                    if (componentIndex >= components.length) {
                        break;
                    }

                    const finalRow = (br * blockHeight) + rInBlock;
                    const finalCol = (bc * blockWidth) + cInBlock;

                    if (finalRow < totalRows && finalCol < columns) {
                        const child = components[componentIndex];
                        const cellX = finalCol * cellWidth;
                        const cellY = finalRow * cellHeight;
                        child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
                        componentIndex++;
                    }
                }
                if (componentIndex >= components.length) break;
            }
            if (componentIndex >= components.length) break;
        }
        if (componentIndex >= components.length) break;
    }

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Fills the grid from all four corners simultaneously, with paths converging towards the center.
 * This version uses a robust "shell-by-shell" path generation to be immune to infinite loops
 * and produce the correct visual pattern.
 * @private
 */
const _layoutSquareCornerConverge = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 5 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    const finalPositions: { r: number; c: number }[] = [];

    let minR = 0, maxR = totalRows - 1;
    let minC = 0, maxC = columns - 1;

    while (finalPositions.length < components.length && minR <= maxR && minC <= maxC) {
        const pathTL: { r: number; c: number }[] = [];
        const pathTR: { r: number; c: number }[] = [];
        const pathBR: { r: number; c: number }[] = [];
        const pathBL: { r: number; c: number }[] = [];

        for (let i = 0; i <= maxC - minC; i++) {
            pathTL.push({ r: minR, c: minC + i });
            pathBR.push({ r: maxR, c: maxC - i });
        }
        for (let i = 0; i <= maxR - minR; i++) {
            pathTR.push({ r: minR + i, c: maxC });
            pathBL.push({ r: maxR - i, c: minC });
        }

        pathTL.pop();
        pathTR.pop();
        pathBR.pop();
        pathBL.pop();

        const paths = [pathTL, pathTR, pathBR, pathBL];

        const maxPathLength = Math.max(...paths.map(p => p.length));
        for (let i = 0; i < maxPathLength; i++) {
            for (let j = 0; j < paths.length; j++) {
                if (i < paths[j].length) {
                    finalPositions.push(paths[j][i]);
                }
            }
        }

        minR++; maxR--; minC++; maxC--;
    }

    components.forEach((child, i) => {
        if (i >= finalPositions.length) return;
        const pos = finalPositions[i];
        const cellX = pos.c * cellWidth;
        const cellY = pos.r * cellHeight;
        child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
    });

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Fills the grid in a standard flow, but only places components in cells that form a diamond shape
 * that fills the entire grid area. Extra components that do not fit are hidden.
 * @private
 */
const _layoutSquareDiamondFill = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 5 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    const centerX = (columns - 1) / 2;
    const centerY = (totalRows - 1) / 2;

    const validPositions: { r: number, c: number }[] = [];
    for (let r = 0; r < totalRows; r++) {
        const verticalProgress = centerY > 0 ? Math.abs(r - centerY) / centerY : 0;

        const diamondWidth = Math.max(1, columns * (1 - verticalProgress));

        const startCol = Math.ceil(centerX - diamondWidth / 2);
        const endCol = Math.floor(centerX + diamondWidth / 2);

        for (let c = startCol; c <= endCol; c++) {
            if (c >= 0 && c < columns) {
                validPositions.push({ r, c });
            }
        }
    }

    components.forEach((child, i) => {
        if (i < validPositions.length) {
            const pos = validPositions[i];
            const cellX = pos.c * cellWidth;
            const cellY = pos.r * cellHeight;
            child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
        } else {
            if ((child as any).visible !== undefined) {
                (child as any).visible = false;
            }
        }
    });

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Arranges components in a grid by filling anti-diagonals.
 * @private
 */
const _layoutSquareDiagonalFill = (components: LayoutComponent[], options: LayoutOptions = {}): Bounds => {
    const { columns = 5 } = options;
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);
    const totalRows = Math.ceil(components.length / columns);

    let componentIndex = 0;
    const max_sum = totalRows + columns - 2;

    for (let sum = 0; sum <= max_sum; sum++) {
        for (let r = 0; r < totalRows; r++) {
            const c = sum - r;
            if (c >= 0 && c < columns) {
                if (componentIndex < components.length) {
                    const child = components[componentIndex];
                    const cellX = c * cellWidth;
                    const cellY = r * cellHeight;
                    child.position.set(cellX + maxChildWidth / 2, cellY + maxChildHeight / 2);
                    componentIndex++;
                } else {
                    break;
                }
            }
        }
    }

    const gridWidth = columns * cellWidth - columnGap;
    const totalHeight = totalRows * cellHeight - rowGap;
    return { minX: 0, minY: 0, maxX: gridWidth, maxY: totalHeight };
};

/**
 * Arranges components in vertical "reels" (columns).
 * Elements in each reel are stacked from the bottom-up (Gravity).
 * If an element is removed from the middle of the array, elements above it
 * will "drop" down to fill the gap in the next layout pass.
 *
 * @private
 */
const _layoutReels = (components: LayoutComponent[], options: LayoutOptions): Bounds => {
    const {
        columns = 5,
        justifyItems = 'center',
        alignItems = 'end',
        stagger = 0,
    } = options as any;

    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const { cellWidth, cellHeight, maxChildWidth, maxChildHeight, columnGap, rowGap } = _calculateGridCellSize(components, options);

    const reels: LayoutComponent[][] = Array.from({ length: columns }, () => []);

    components.forEach((child, i) => {
        const rIndex = (child as any).reelIndex !== undefined
            ? (child as any).reelIndex % columns
            : i % columns;
        reels[rIndex].push(child);
    });

    const maxItemsInAnyReel = Math.max(...reels.map(r => r.length));

    reels.forEach((reel, colIndex) => {
        const reelStagger = colIndex * stagger;

        reel.forEach((child, rowIndex) => {
            const useFixed = options.sizingMode === 'fixed';
            const childWidth = useFixed ? (options.fixedWidth ?? 0) : child.width;
            const childHeight = useFixed ? (options.fixedHeight ?? 0) : child.height;

            const xBase = colIndex * cellWidth;
            let childX: number;
            switch (justifyItems) {
                case 'start': childX = xBase + childWidth / 2; break;
                case 'end':   childX = xBase + maxChildWidth - childWidth / 2; break;
                default:      childX = xBase + maxChildWidth / 2; break;
            }

            let childY: number;
            if (alignItems === 'start') {
                childY = (rowIndex * cellHeight) + childHeight / 2 + reelStagger;
            } else {
                const visualRow = (maxItemsInAnyReel - 1) - rowIndex;
                childY = (visualRow * cellHeight) + maxChildHeight - childHeight / 2 + reelStagger;
            }

            child.position.set(childX, childY);
        });
    });

    return {
        minX: 0, minY: 0,
        maxX: columns * cellWidth - columnGap,
        maxY: maxItemsInAnyReel * cellHeight - rowGap + ((columns - 1) * stagger)
    };
};

/**
 * Arranges components as if they are wrapped around a rotating cylinder (slot machine reel).
 * The 'spinDegrees' property rotates the entire cylinder.
 * Items move vertically, scaling down and fading (via zIndex/scale) as they move to the back.
 *
 * @private
 * @param {LayoutComponent[]} components - The components to arrange.
 * @param {LayoutOptions} options - Configuration.
 * Uses `spinDegrees`, `radius`, `itemAngleStep`, and `perspective`.
 */
const _layoutReelSpinner = (components: LayoutComponent[], options: LayoutOptions): Bounds => {
    const {
        spinDegrees = 0,
        radius = 250,
        itemAngleStep = 30,
        depthScale = 0.5,
        vertical = true,
        width = 200,
        height = 400
    } = options as any;

    if (components.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const toRad = (deg: number) => deg * (Math.PI / 180);
    const spinRad = toRad(spinDegrees);
    const stepRad = toRad(itemAngleStep);
    const stableComponents = [...components].sort((a: any, b: any) => (a.layoutId || 0) - (b.layoutId || 0));

    stableComponents.forEach((child, i) => {
        const angle = (i * stepRad) + spinRad;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const offset = sin * radius;
        if (vertical) {
            child.position.set(0, offset);
        } else {
            child.position.set(offset, 0);
        }

        const isVisible = cos > 0;
        if ((child as any).scale) {
            if (!isVisible) {
                (child as any).scale.set(0);
                (child as any).visible = false;
            } else {
                (child as any).visible = true;
                const s = 1 - (1 - cos) * depthScale;
                (child as any).scale.set(s);
            }
        }
        if ((child as any).zIndex !== undefined) {
            (child as any).zIndex = Math.floor(cos * 1000);
        }
    });

    return {
        minX: -width / 2,
        maxX: width / 2,
        minY: -height / 2,
        maxY: height / 2
    };
};

export { applyLayout };