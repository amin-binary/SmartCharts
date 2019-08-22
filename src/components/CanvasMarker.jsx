import React from 'react';
import { connect } from '../store/Connect';

// Renderless component that creates CIQ.Drawings
// Docs: https://documentation.chartiq.com/tutorial-Using%20and%20Customizing%20Drawing%20Tools.html#the-drawing-object
class CanvasMarker extends React.Component {
    ctx = null;
    stx = null;

    drawings = [];

    componentWillMount() { this.remove_all(); }

    componentDidMount() {
        const { contextPromise, markerRef } = this.props;

        contextPromise.then((ctx) => {
            this.ctx = ctx;
            this.stx = this.ctx.stx;

            if (markerRef) {
                markerRef({
                    add_shape: this.add_shape.bind(this),
                    remove_all: this.remove_all.bind(this),
                    remove: this.remove.bind(this),
                });
            }
        });
    }

    add_shape({
        fc, col, lw, d0, v0, tzo0, a, sx, sy, ptrn,
        dimension, points,
    }) {
        // random name
        const name = `_${Math.random().toString(36).substring(7)}`;
        const config = {
            name,
            pnl: 'chart',
            col: col || 'auto',
            fc: fc || '#7DA6F5',
            ptrn: ptrn || 'solid',
            lw: typeof lw === 'number' ? lw : 1,
            d0,
            v0,
            tzo0: tzo0 || 0,
            a: a || 0,
            sx: sx || 1,
            sy: sy || 1,
        };

        // Unfortunately CIQ doesn't expose it's support for custom
        // svg paths, here is the hack to render any svg path.
        CIQ.Drawing[name] = function () {
            this.name = name;
            this.dimension = dimension;
            this.points = points;
        };
        CIQ.Drawing[name].ciqInheritsFrom(CIQ.Drawing.shape);
        const drawing = this.stx.createDrawing(name, config);
        // disable highlighting
        drawing.intersected = () => null;
        // TODO: do not export canvas drawings
        drawing.ignore_export = true;
        this.drawings.push(drawing);
        return drawing;
    }

    remove_all() {
        this.drawings.forEach(d => this.remove(d));
        this.drawings = [];
    }
    remove(drawing) {
        this.stx.removeDrawing(drawing);
        this.drawings = this.drawings.filter(d => d !== drawing);
    }

    render() { return null; }
}

export default connect(({ chart }) => ({
    contextPromise: chart.contextPromise,
}))(CanvasMarker);
