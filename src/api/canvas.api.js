export const shapeResponse = [{"id":"square","type":"shape","split":false,"title":"Square","corners":[{"x":10,"y":250},{"x":10,"y":440},{"x":290,"y":440},{"x":290,"y":250}],"fillColor":"#ed7d31"},{"id":"triangle","type":"shape","split":false,"title":"Triangle","corners":[{"x":300,"y":10},{"x":210,"y":220},{"x":390,"y":220}],"fillColor":"#009800"},{"id":"circle","type":"circle","split":false,"title":"Circle","params":{"x":530,"y":320,"radius":120,"endAngle":6.283185307179586,"startAngle":0},"fillColor":"#ffc003"}];

export const getShapes = async _ => {
    return new Promise((resolve, reject) => {
      resolve(shapeResponse)
    });
  };
