

## `CanvasRenderingContext2D.drawImage()`
Read more: [Mozilla Offical Docs](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)


## Parameters
`image`

> An element to draw into the context. The specification permits any canvas image source, specifically, an HTMLImageElement, an SVGImageElement, an HTMLVideoElement, an HTMLCanvasElement, an ImageBitmap, an OffscreenCanvas, or a VideoFrame.

`sx Optional`
> The x-axis coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context. Use the 3- or 5-argument syntax to omit this argument.

`sy Optional`
> The y-axis coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context. Use the 3- or 5-argument syntax to omit this argument.

`sWidth Optional`
> The width of the sub-rectangle of the source image to draw into the destination context. If not specified, the entire rectangle from the coordinates specified by sx and sy to the bottom-right corner of the image is used. Use the 3- or 5-argument syntax to omit this argument. A negative value will flip the image.

`sHeight Optional`
> The height of the sub-rectangle of the source image to draw into the destination context. Use the 3- or 5-argument syntax to omit this argument. A negative value will flip the image.

`dx`
> The x-axis coordinate in the destination canvas at which to place the top-left corner of the source image.

`dy`
> The y-axis coordinate in the destination canvas at which to place the top-left corner of the source image.

`dWidth`
> The width to draw the image in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in width when drawn. Note that this argument is not included in the 3-argument syntax.

`dHeight`
> The height to draw the image in the destination canvas. This allows scaling of the drawn image. If not specified, the image is not scaled in height when drawn. Note that this argument is not included in the 3-argument syntax.