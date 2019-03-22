(function (window) {
    function test(name, cb) {
        let r;
        try {
            r = cb();
        } catch (e) {
            console.error(e);
            r = e.message;
        }
        if (!r) {
            return;
        }
        console.error('[Test: ' + name + '] ' + r);
    }
    function expect(objReal) {
        return {
            toBe: function(objExpected, errorMsg) {
                const r = JSON.stringify(objReal) === JSON.stringify(objExpected);
                if (r) {
                    return;
                }
                if (errorMsg) {
                    console.error(errorMsg);
                }
                console.error('Expected:', objExpected, 'Got:', objReal);
                throw new Error('Test failed');
            }
        };
    }


/*************************************************************************************************/
    // graph-data
    test('transformGraphData', function(){
        const graphDataSource = {
            colors: {yid1: 'color1', yid2: 'color2'},
            columns: [
                ['yid1', 1, 2, 3],
                ['xid', 11, 22, 33],
                ['yid2', 111, 222, 333]
            ],
            names: {yid1: 'name1', yid2: 'name2'},
            types: {yid1: 'line', yid2: 'line', xid: 'x'}
        };
        const graphDataExpects = [{
            color: 'color1',
            name: 'name1',
            values: [[11, 1], [22, 2], [33, 3]]
        }, {
            color: 'color2',
            name: 'name2',
            values: [[11, 111], [22, 222], [33, 333]]
        }];
        const graphData = transformGraphData(graphDataSource);
        expect(graphDataExpects).toBe(graphData);
    });
    // color
    test('colorToRgba failed parameter', function() {
        expect(colorToRgba(0)).toBe(null);
    });
    test('colorToRgba hex 3', function() {
        expect(colorToRgba('#09f')).toBe({r: 0, g: parseInt('99', 16), b: parseInt('ff', 16), a: 1});
    });
    test('colorToRgba hex 6', function() {
        expect(colorToRgba('#039af0')).toBe({r: parseInt('03', 16), g: parseInt('9a', 16), b: parseInt('f0', 16), a: 1});
    });
    test('colorToRgba rgb', function() {
        expect(colorToRgba('rGb(10,110, 254)')).toBe({r: 10, g: 110, b: 254, a: 1});
    });
    test('colorToRgba rgba', function() {
        expect(colorToRgba('rgBa(1,   65, 200, 0.22)')).toBe({r: 1, g: 65, b: 200, a: 0.22});
    });
    test('colorToRgba unknown', function() {
        expect(colorToRgba('unknown')).toBe(null);
    });
    test('rgbaToColor', function() {
        expect(rgbaToColor({r: 1, g: 2, b: 5, a: 0.4})).toBe('rgba(1,2,5,0.4)');
    });
    test('rgbaPlusOpacity', function() {
        expect(rgbaPlusOpacity({r: 1, g: 2, b: 5, a: 0.4}, 0.2)).toBe({r: 1, g: 2, b: 5, a: 0.4 * 0.2});
    });

    // area-main
    (function(ns) {
        test('mergeLabelsToAxle init', function() {
            const dst = null;
            const src = {
                0: '0',
                10: '10',
                20: '20',
                30: '30',
                40: '40',
                50: '50'
            };
            const exp = {
                0: {
                    label: '0'
                },
                10: {
                    label: '10'
                },
                20: {
                    label: '20'
                },
                30: {
                    label: '30'
                },
                40: {
                    label: '40'
                },
                50: {
                    label: '50'
                }
            };
            expect(ns.mergeLabelsToAxle(dst, src)).toBe(exp);
        });
        test('mergeLabelsToAxle change numbers', function() {
            const dst = {
                0: {
                    label: '0'
                },
                50: {
                    label: '50'
                },
                100: {
                    label: '100'
                }
            };
            const src = {
                0: '0',
                10: '10',
                20: '20',
                30: '30',
                40: '40',
                50: '50'
            };
            const exp = {
                0: {
                    label: '0'
                },
                50: {
                    label: '50'
                },
                100: {
                    label: '100',
                    way: ns.TO_HIDE,
                    opacity: 1
                },
                10: {
                    label: '10',
                    way: ns.TO_SHOW,
                    opacity: 0
                },
                20: {
                    label: '20',
                    way: ns.TO_SHOW,
                    opacity: 0
                },
                30: {
                    label: '30',
                    way: ns.TO_SHOW,
                    opacity: 0
                },
                40: {
                    label: '40',
                    way: ns.TO_SHOW,
                    opacity: 0
                }
            };
            expect(ns.mergeLabelsToAxle(dst, src)).toBe(exp);
        });

        test('mergeLabelsToAxle change during animation', function() {
            const dst = {
                0: {
                    label: '0'
                },
                50: {
                    label: '50'
                },
                100: {
                    label: '100',
                    way: ns.TO_HIDE,
                    opacity: 0.2
                },
                10: {
                    label: '10',
                    way: ns.TO_SHOW,
                    opacity: 0.8
                },
                20: {
                    label: '20',
                    way: ns.TO_SHOW,
                    opacity: 0.8
                },
                30: {
                    label: '30',
                    way: ns.TO_SHOW,
                    opacity: 0.8
                },
                40: {
                    label: '40',
                    way: ns.TO_SHOW,
                    opacity: 0.8
                }
            };
            const src = {
                0: '0',
                50: '50',
                100: '100',
                150: '150',
                200: '200'
            };
            const exp = {
                0: {
                    label: '0'
                },
                50: {
                    label: '50'
                },
                100: {
                    label: '100',
                    way: ns.TO_SHOW,
                    opacity: 0.2
                },
                10: {
                    label: '10',
                    way: ns.TO_HIDE,
                    opacity: 0.8
                },
                20: {
                    label: '20',
                    way: ns.TO_HIDE,
                    opacity: 0.8
                },
                30: {
                    label: '30',
                    way: ns.TO_HIDE,
                    opacity: 0.8
                },
                40: {
                    label: '40',
                    way: ns.TO_HIDE,
                    opacity: 0.8
                },
                150: {
                    label: '150',
                    way: ns.TO_SHOW,
                    opacity: 0
                },
                200: {
                    label: '200',
                    way: ns.TO_SHOW,
                    opacity: 0
                }
            };
            expect(ns.mergeLabelsToAxle(dst, src)).toBe(exp);
        });

        test('updateAxle in progress', function() {
            const axle = {
                0: {
                    label: '0'
                },
                50: {
                    label: '50'
                },
                80: {
                    label: '80',
                    way: ns.TO_HIDE,
                    opacity: NaN
                },
                100: {
                    label: '100',
                    way: ns.TO_HIDE,
                    opacity: NaN
                },
                10: {
                    label: '10',
                    way: ns.TO_SHOW,
                    opacity: NaN
                },
                20: {
                    label: '20',
                    way: ns.TO_SHOW,
                    opacity: NaN
                }
            };
            const progress = 0.7;
            const startAxle = {
                0: {
                    label: '0'
                },
                50: {
                    label: '50'
                },
                80: {
                    label: '80',
                    way: ns.TO_HIDE,
                    opacity: 1
                },
                100: {
                    label: '100',
                    way: ns.TO_HIDE,
                    opacity: 0.6
                },
                10: {
                    label: '10',
                    way: ns.TO_SHOW,
                    opacity: 0
                },
                20: {
                    label: '20',
                    way: ns.TO_SHOW,
                    opacity: 0.2
                }
            };
            const exp = {
                0: {
                    label: '0'
                },
                50: {
                    label: '50'
                },
                80: {
                    label: '80',
                    way: ns.TO_HIDE,
                    opacity: 1 - 1 * progress
                },
                100: {
                    label: '100',
                    way: ns.TO_HIDE,
                    opacity: 0.6 - 0.6 * progress
                },
                10: {
                    label: '10',
                    way: ns.TO_SHOW,
                    opacity: 0 + 1 * progress
                },
                20: {
                    label: '20',
                    way: ns.TO_SHOW,
                    opacity: 0.2 + 0.8 * progress
                }
            };
            ns.updateAxle(axle, progress, startAxle);
            expect(axle).toBe(exp);
        });

        test('updateAxle complete progress', function() {
            const axle = {
                0: {
                    label: '0'
                },
                50: {
                    label: '50'
                },
                80: {
                    label: '80',
                    way: ns.TO_HIDE,
                    opacity: NaN
                },
                100: {
                    label: '100',
                    way: ns.TO_HIDE,
                    opacity: NaN
                },
                10: {
                    label: '10',
                    way: ns.TO_SHOW,
                    opacity: NaN
                },
                20: {
                    label: '20',
                    way: ns.TO_SHOW,
                    opacity: NaN
                }
            };
            const progress = 1.0;
            const startAxle = {
                0: {
                    label: '0'
                },
                50: {
                    label: '50'
                },
                80: {
                    label: '80',
                    way: ns.TO_HIDE,
                    opacity: 1
                },
                100: {
                    label: '100',
                    way: ns.TO_HIDE,
                    opacity: 0.6
                },
                10: {
                    label: '10',
                    way: ns.TO_SHOW,
                    opacity: 0
                },
                20: {
                    label: '20',
                    way: ns.TO_SHOW,
                    opacity: 0.2
                }
            };
            const exp = {
                0: {
                    label: '0'
                },
                50: {
                    label: '50'
                },
                10: {
                    label: '10'
                },
                20: {
                    label: '20'
                }
            };
            ns.updateAxle(axle, progress, startAxle);
            expect(axle).toBe(exp);
        });
    })(TEST_FS['area-main']);
})(window);
