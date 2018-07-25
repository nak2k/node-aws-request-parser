function expandShapes(service) {
  return {
    ...service,
    operations: expandObject(service.shapes, [])(service.operations),
  };
}

const expandObject = (shapes, shapeContext) => object => {
  const { shape } = object;

  if (shape && shapeContext.indexOf(shape) < 0) {
    object = {
      ...(shapes[shape]),
      ...object,
    };

    delete object.shape;
    shapeContext = [...shapeContext, shape];
  }

  return mapValues(object, expandValue(shapes, shapeContext));
}

const expandValue = (shapes, shapeContext) => v => {
  if (Array.isArray(v)) {
    return v.map(expandValue(shapes, shapeContext));
  } else if (typeof v === 'object') {
    return expandObject(shapes, shapeContext)(v);
  } else {
    return v;
  }
};

function mapValues(object, mapper) {
  const result = {
  };

  Object.entries(object).forEach(([name, value]) => {
    result[name] = mapper(value);
  });

  return result;
}

/*
 * Exports.
 */
exports.expandShapes = expandShapes;
