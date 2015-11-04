var util = require('./util');
var xmlBuilder = require('xmlbuilder');

module.exports = function(profiles) {
    var self = this;

    var buildPrimitive = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var value = obj;

        if (typeof value == 'string') {
            value = value.replace(/&/g, '&amp;');
        }

        var primitiveNode = node.ele(name);
        primitiveNode.att('value', value);
    };

    var buildPrimitiveProperty = function(node, obj, name) {
        if (!obj[name]) {
            return;
        }

        buildPrimitive(node, obj[name], name);
    };

    var buildExtension = function(node, obj, name) {
        var extensionNode = node.ele(name);

        if (obj.url) {
            extensionNode.att('url', obj.url);
        }

        for (var i in obj) {
            if (i == 'url') {
                continue;
            }

            var valueElementType = i.length > 5 ? i.substring(5) : '';
            var isPrimitive = util.IsPrimitive(valueElementType);

            if (isPrimitive) {
                buildPrimitive(extensionNode, obj[i], i);
                continue;
            }

            var builder = null;

            switch (i) {
                case 'valueCode':
                    builder = buildPrimitive;
                    break;
                case 'valueCoding':
                    builder = buildCoding;
                    break;
                case 'valueAttachment':
                    builder = buildAttachment;
                    break;
                case 'valueIdentifier':
                    builder = buildIdentifier;
                    break;
                case 'valueQuantity':
                    builder = buildQuantity;
                    break;
                case 'valueRange':
                    builder = buildRange;
                    break;
                case 'valuePeriod':
                    builder = buildPeriod;
                    break;
                case 'valueRatio':
                    builder = buildRatio;
                    break;
                case 'valueHumanName':
                    builder = buildHumanName;
                    break;
                case 'valueAddress':
                    builder = buildAddress;
                    break;
                case 'valueReference':
                    builder = buildReference;
                    break;
                default:
                    throw 'Unexpected extension value type: ' + i;
            }

            builder(extensionNode, obj[i], i);
        }
    };

    var buildExtensionProperty = function(node, obj) {
        if (!obj || !obj.extension || obj.extension.length == 0) {
            return;
        }

        buildExtension(node, obj.extension, 'extension');
    };

    var buildReference = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildPrimitiveProperty(newNode, obj, 'reference');
        buildPrimitiveProperty(newNode, obj, 'display');
    };

    var buildCoding = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildPrimitiveProperty(newNode, obj, 'system');
        buildPrimitiveProperty(newNode, obj, 'version');
        buildPrimitiveProperty(newNode, obj, 'code');
        buildPrimitiveProperty(newNode, obj, 'display');

        // DSTU2 removed "primary" and added "userSelected"
        buildPrimitiveProperty(newNode, obj, 'userSelected');

        buildReference(newNode, obj.valueSet, 'valueSet');
    };

    var buildCodeableConcept = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        if (obj.coding && obj.coding.length > 0) {
            for (var i in obj.coding) {
                buildCoding(newNode, obj.coding[0], 'coding');
            }
        }

        buildPrimitiveProperty(newNode, obj, 'text');
    };

    var buildPeriod = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildPrimitiveProperty(newNode, obj, 'start');
        buildPrimitiveProperty(newNode, obj, 'end');
    };

    var buildIdentifier = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildPrimitiveProperty(newNode, obj, 'use');
        buildCodeableConcept(newNode, obj, 'type');
        buildPrimitiveProperty(newNode, obj, 'system');
        buildPrimitiveProperty(newNode, obj, 'value');

        buildPeriod(newNode, obj.period, 'period');

        buildReference(newNode, obj.assigner, 'assigner');
    };

    var buildNarrative = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildPrimitiveProperty(newNode, obj, 'status');

        var divValue = obj.div;

        if (divValue) {
            if (typeof divValue == 'string') {
                divValue = divValue.replace(/&/g, '&amp;');
            }

            var childDiv = newNode.ele('div');
            childDiv.att('xmlns', 'http://www.w3.org/1999/xhtml');
            childDiv.raw(divValue);
        }
    };

    var buildHumanName = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildPrimitiveProperty(newNode, obj, 'use');
        buildPrimitiveProperty(newNode, obj, 'text');

        if (obj.family && obj.family.length > 0) {
            for (var i in obj.family) {
                buildPrimitive(newNode, obj.family[i], 'family');
            }
        }

        if (obj.given && obj.given.length > 0) {
            for (var i in obj.given) {
                buildPrimitive(newNode, obj.given[i], 'given');
            }
        }

        if (obj.prefix && obj.prefix.length > 0) {
            for (var i in obj.prefix) {
                buildPrimitive(newNode, obj.prefix[i], 'prefix');
            }
        }

        if (obj.suffix && obj.suffix.length > 0) {
            for (var i in obj.suffix) {
                buildPrimitive(newNode, obj.suffix[i], 'suffix');
            }
        }

        buildPeriod(newNode, obj.period, 'period');
    };

    var buildAttachment = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildPrimitiveProperty(newNode, obj, 'contentType');
        buildPrimitiveProperty(newNode, obj, 'language');
        buildPrimitiveProperty(newNode, obj, 'data');
        buildPrimitiveProperty(newNode, obj, 'url');
        buildPrimitiveProperty(newNode, obj, 'size');
        buildPrimitiveProperty(newNode, obj, 'hash');
        buildPrimitiveProperty(newNode, obj, 'title');

        // DSTU2 added "creation"
        buildPrimitiveProperty(newNode, obj, 'creation');
    };

    var buildResource = function(node, obj, name) {
        if (!obj) {
            return;
        }

        if (!obj.resourceType) {
            throw 'Embedded resource does not have resourceType';
        }

        var resourceType = obj.resourceType;
        var newNode = node.ele(resourceType);
        newNode.att('xmlns', 'http://hl7.org/fhir');

        delete obj.resourceType;

        buildObject(newNode, obj, resourceType);
    };

    var buildQuantity = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildPrimitiveProperty(newNode, obj, 'value');
        buildPrimitiveProperty(newNode, obj, 'comparator');
        buildPrimitiveProperty(newNode, obj, 'unit');           // DSTU2 changed "units" to "unit"
        buildPrimitiveProperty(newNode, obj, 'system');
        buildPrimitiveProperty(newNode, obj, 'code');
    };

    var buildRange = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildQuantity(newNode, obj.low, 'low');
        buildQuantity(newNode, obj.high, 'high');
    };

    var buildRatio = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildQuantity(newNode, obj.numerator, 'numerator');
        buildQuantity(newNode, obj.denominator, 'denominator');
    };

    var buildAddress = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildPrimitiveProperty(newNode, obj, 'use');
        buildPrimitiveProperty(newNode, obj, 'type');
        buildPrimitiveProperty(newNode, obj, 'text');

        if (obj.line && obj.line.length > 0) {
            for (var i in obj.line) {
                buildPrimitive(newNode, obj.line[i], 'line');
            }
        }

        buildPrimitiveProperty(newNode, obj, 'city');
        buildPrimitiveProperty(newNode, obj, 'district');
        buildPrimitiveProperty(newNode, obj, 'state');
        buildPrimitiveProperty(newNode, obj, 'postalCode');         // DSTU2 changed "zip" to "postalCode"
        buildPrimitiveProperty(newNode, obj, 'country');

        buildPeriod(newNode, obj.period, 'period');
    };

    var buildContactPoint = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildPrimitiveProperty(newNode, obj, 'system');
        buildPrimitiveProperty(newNode, obj, 'value');
        buildPrimitiveProperty(newNode, obj, 'use');
        buildPrimitiveProperty(newNode, obj, 'rank');

        buildQuantity(newNode, obj.period, 'period');
    };

    var buildSampledData = function(node, obj, name) {
        if (!obj) {
            return;
        }

        var newNode = node.ele(name);

        buildExtensionProperty(newNode, obj);

        buildQuantity(newNode, obj.origin, 'origin');

        buildPrimitiveProperty(newNode, obj, 'period');
        buildPrimitiveProperty(newNode, obj, 'factor');
        buildPrimitiveProperty(newNode, obj, 'lowerLimit');
        buildPrimitiveProperty(newNode, obj, 'upperLimit');
        buildPrimitiveProperty(newNode, obj, 'dimensions');
        buildPrimitiveProperty(newNode, obj, 'data');
    };

    var getChildElements = function(elementPath) {
        var elementPathSplit = elementPath.split('.');
        var profile;

        for (var i in profiles) {
            if (i.toLowerCase() == elementPathSplit[0].toLowerCase()) {
                profile = profiles[i];
                break;
            }
        }

        if (!profile) {
            return [];
        }

        if (!profile.snapshot) {
            throw 'No snapshot defined for profile ' + elementPathSplit[0];
        }

        var childElements = [];
        var regex = new RegExp('^' + elementPath + '\.([A-z\\[\\]0-9]*)$');

        for (var i in profile.snapshot.element) {
            var element = profile.snapshot.element[i];

            if (!regex.test(element.path)) {
                continue;
            }

            var regexResult = regex.exec(element.path);

            childElements.push(regexResult[1]);
        }

        return childElements;
    };

    var findObjectProperty = function(obj, propertyName) {
        if (!propertyName) {
            return;
        }

        if (propertyName.indexOf('[x]') == propertyName.length - 3) {
            for (var i in util.ChoiceTypes) {
                var nextPropertyName = propertyName.replace('[x]', util.ChoiceTypes[i]);

                if (obj[nextPropertyName]) {
                    return nextPropertyName;
                }
            }
        }

        return propertyName;
    };

    var buildObject = function(node, obj, elementPath) {
        var childElements = getChildElements(elementPath);

        // Loop through each child element in order
        for (var i in childElements) {
            var propertyName = findObjectProperty(obj, childElements[i]);

            if (!obj[propertyName]) {
                continue;
            }

            var nextElementPath = elementPath + '.' + propertyName;
            var element = util.FindElement(nextElementPath, profiles);
            var elementType = element && element && element.type && element.type.length > 0 ? element.type[0].code : null;
            var isPrimitive = util.IsPrimitive(elementType);

            if (isPrimitive) {
                buildPrimitive(node, obj[propertyName], propertyName);
                continue;
            }

            var buildFunction = null;

            switch (elementType) {
                case 'extension':
                case 'Extension':
                    buildFunction = buildExtension;
                    break;
                case 'Coding':
                    buildFunction = buildCoding;
                    break;
                case 'CodeableConcept':
                    buildFunction = buildCodeableConcept;
                    break;
                case 'Identifier':
                    buildFunction = buildIdentifier;
                    break;
                case 'Reference':
                    buildFunction = buildReference;
                    break;
                case 'Period':
                    buildFunction = buildPeriod;
                    break;
                case 'Narrative':
                    buildFunction = buildNarrative;
                    break;
                case 'HumanName':
                    buildFunction = buildHumanName;
                    break;
                case 'Attachment':
                    buildFunction = buildAttachment;
                    break;
                case 'Resource':
                    buildFunction = buildResource;
                    break;
                case 'Quantity':
                case 'Age':
                case 'Distance':
                case 'Duration':
                case 'Count':
                case 'Money':
                    buildFunction = buildQuantity;
                    break;
                case 'Range':
                    buildFunction = buildRange;
                    break;
                case 'Ratio':
                    buildFunction = buildRatio;
                    break;
                case 'Address':
                    buildFunction = buildAddress;
                    break;
                case 'ContactPoint':
                    buildFunction = buildContactPoint;
                    break;
                case 'SampledData':
                    buildFunction = buildSampledData;
                    break;
                case 'Resource':
                    buildFunction = buildResource;
                    break;
                case 'Meta':
                case 'BackboneElement':
                    break;
                default:
                    if (elementType) {
                        throw 'Type not recognized: ' + elementType;
                    }
            }

            if (buildFunction) {
                if (obj[propertyName] instanceof Array) {
                    for (var x in obj[propertyName]) {
                        buildFunction(node, obj[propertyName][x], propertyName);
                    }
                } else {
                    buildFunction(node, obj[propertyName], propertyName);
                }
            } else {
                if (obj[propertyName] instanceof Array) {
                    for (var x in obj[propertyName]) {
                        var childNode = node.ele(propertyName);
                        buildObject(childNode, obj[propertyName][x], nextElementPath);
                    }
                } else if (typeof obj[propertyName] == 'object') {
                    var childNode = node.ele(propertyName);
                    buildObject(childNode, obj[propertyName], nextElementPath);
                }
            }
        }

        for (var i in obj) {
            if (i.toString().indexOf('_') == 0 && obj[i]) {
                node.att(i.substring(1), obj[i]);
            } else if (i == "id" && elementPath.indexOf('Bundle') != 0 && obj[i]) {
                node.att('id', obj[i]);
            }
        }
    };

    self.CreateXml = function(jsObj) {
        var copy = JSON.parse(JSON.stringify(jsObj));
        var doc = xmlBuilder.create(jsObj.resourceType);
        doc.att('xmlns', 'http://hl7.org/fhir');

        delete copy.resourceType;

        buildObject(doc, copy, jsObj.resourceType);

        var xml = doc.end({ pretty: true });

        return xml;
    };
};