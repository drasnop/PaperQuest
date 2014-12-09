/**
 * Function allowing to 'wrap' the text from an SVG <text> element with <tspan>.
 * Based on https://github.com/mbostock/d3/issues/1642
 * @exemple svg.append("g")
 *      .attr("class", "x axis")
 *      .attr("transform", "translate(0," + height + ")")
 *      .call(xAxis)
 *      .selectAll(".tick text")
 *          .call(d3TextWrap, x.rangeBand());
 *
 * @param text d3 selection for one or more <text> object
 * @param width number - global width in which the text will be word-wrapped.
 * @param paddingRightLeft integer - Padding right and left between the wrapped text and the 'invisible bax' of 'width' width
 * @param paddingTopBottom integer - Padding top and bottom between the wrapped text and the 'invisible bax' of 'width' width
 * @returns Array[number] - Number of lines created by the function, stored in a Array in case multiple <text> element are passed to the function
 */
function d3TextWrap(text, width, paddingRightLeft, paddingTopBottom) {
    paddingRightLeft = paddingRightLeft || 5; //Default padding (5px)
    paddingTopBottom = (paddingTopBottom || 5) - 2; //Default padding (5px), remove 2 pixels because of the borders
    var maxWidth = width; //I store the tooltip max width
    width = width - (paddingRightLeft * 2); //Take the padding into account

    var arrLineCreatedCount = [];
    //console.log("begin word brake for the abstracts in the visibleFringe...");
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/[ \f\n\r\t\v]+/).reverse(), //Don't cut non-breaking space (\xA0), as well as the Unicode characters \u00A0 \u2028 \u2029)
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, //Ems
            x,
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            createdLineCount = 1, //Total line created count
            textAlign = text.style('text-anchor') || 'start'; //'start' by default (start, middle, end, inherit)

        //Clean the data in case <text> does not define those values
        if (isNaN(dy)) dy = 0; //Default padding (0em) : the 'dy' attribute on the first <tspan> _must_ be identical to the 'dy' specified on the <text> element, or start at '0em' if undefined

        //Offset the text position based on the text-anchor
        var wrapTickLabels = d3.select(text.node().parentNode).classed('tick'); //Don't wrap the 'normal untranslated' <text> element and the translated <g class='tick'><text></text></g> elements the same way..
        if (wrapTickLabels) {
            switch (textAlign) {
                case 'start':
                    x = -width / 2;
                    break;
                case 'middle':
                    x = 0;
                    break;
                case 'end':
                    x = width / 2;
                    break;
                default :
            }
        }
        else { //untranslated <text> elements
            switch (textAlign) {
                case 'start':
                    x = paddingRightLeft;
                    break;
                case 'middle':
                    x = maxWidth / 2;
                    break;
                case 'end':
                    x = maxWidth - paddingRightLeft;
                    break;
                default :
            }
        }
        y = +((null === y)?paddingTopBottom:y);

        var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        //noinspection JSHint
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width && line.length > 1) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                ++createdLineCount;
            }
        }

        arrLineCreatedCount.push(createdLineCount); //Store the line count in the array
    });
    //console.log(arrLineCreatedCount);
    return arrLineCreatedCount;
}

function endAll (transition, callback) {

    if (transition.empty()) {
        callback();
    }
    else {
        var n = transition.size();
        transition.each("end", function () {
            n--;
            if (n === 0) {
                callback();
            }
        });
    }
}

d3.selection.prototype.moveToBackOf = function(elem) { 
    return this.each(function() { 
        var firstChild = d3.select(elem).node().firstChild; 
        if (firstChild) { 
            d3.select(elem).node().insertBefore(this, firstChild); 
        } 
    }); 
};

d3.selection.prototype.moveToFrontOf = function(elem) {
  return this.each(function(){
    d3.select(elem).node().appendChild(this);
  });
};

// Changes the lightness of a color represented as #112233
function shadeHexColor(color, percent) {  
    var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}