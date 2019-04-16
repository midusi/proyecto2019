export const centroid = (points) => {
  var x = 0, y = 0
  points.forEach(point => {
    x += point.x
    y += point.y
  })
  return {x: x/points.length, y: y/points.length}
}

export const slope = (pointA, pointB) => {
  return (pointB.y-pointA.y)/(pointB.x-pointA.x)
}

export const detectionCoordinates = (detection) =>{
  return [
    {x: detection.x, y: detection.y},
    {x: detection.x + detection.width, y: detection.y},
    {x: detection.x + detection.width, y: detection.y + detection.height},
    {x: detection.x, y: detection.y + detection.height},
  ]
}

export const rotate = (cx, cy, x, y, angle) => {
  var cos = Math.cos(angle),
    sin = Math.sin(angle),
    nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
    ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return {x: nx, y: ny};
}