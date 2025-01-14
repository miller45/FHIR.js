var ParseConformance = require('./parseConformance');
var _ = require('underscore');
var operators = ['=', '!', '&', '<', '>', '~'];

function findClosingParenIndex(string, startIndex) {
    var parenLevel = 0;

    for (var i = startIndex; i < string.length; i++) {
        if (string[i] === '(') {
            parenLevel++;
        } else if (string[i] === ')') {
            if (parenLevel > 0) {
                parenLevel--;
            } else {
                return i;
            }
        }
    }
}

function findClosingQuoteIndex(string, startIndex) {
    for (var i = startIndex; i < string.length; i++) {
        if (string[i] === '\'') {
            if (string[i-1] === '\\') {
                continue;
            }
            return i;
        }
    }
}

/**
 * Constructs a new instance of the FhirPath class with one or mores resources
 * @classdesc Handles evaluation of FhirPath against one or more resources. See {@link http://build.fhir.org/fhirpath.html} for more information.
 * @param {Resource|Array<Resource>} resources One or more resources that the class should evaluate FhirPath against
 * @param {ParseConformance} parser The conformance parser to use when needing to reference definitions of resources
 * @class
 */
function FhirPath(resources, parser) {
    this.resources = resources instanceof Array ? resources : [resources];
    this.parser = parser ? parser : new ParseConformance(true);
}

/**
 * Attempts to resolve the resource reference using this resources.
 * If no resource is found in the resources provided to the FhirPath class, calls the resolve event.
 * @param {string} reference The resource reference string to resolve
 * @return {Resource}
 * @fires FhirPath#resolve
 * @private
 */
FhirPath.prototype._resolve = function(reference) {
    var regex = /^([A-z]+)\/(.+?)$/;
    var match = reference.trim().match(regex);

    function find(resources, resourceType, id) {
        for (var i = 0; i < resources.length; i++) {
            var resource = resources[i];

            if (resource.resourceType === 'Bundle') {
                // recursively search through resources in the bundle
                var childResources = _.map(resource.entry, function(entry) {
                    return entry.resource;
                });

                var found = find(childResources, resourceType, id);

                if (found) {
                    return found;
                }
            }

            if (resource.resourceType.toLowerCase() !== resourceType.toLowerCase()) {
                continue;
            }

            if (resource.id.toLowerCase() !== id.toLowerCase()) {
                continue;
            }

            return resource;
        }
    }

    if (match) {
        var found = find(this.resources, match[1], match[2]);

        if (found) {
            return found;
        }
    }

    return this.resolve(reference);
}

/**
 * A callback which is executed when a reference needs to be resolved to a resource.
 * This should be overridden by the caller of the FhirPath class.
 * @param {string} reference The reference that needs to be resolved
 * @returns Should return a Resource instance
 * @event
 */
FhirPath.prototype.resolve = function(reference) {
    return;
}

/**
 * Gets a list of all resource type names from the ParseConformance class loaded with the FhirPath class.
 * @returns {string[]}
 * @private
 */
FhirPath.prototype._getResourceTypes = function() {
    var self = this;
    var keys = Object.keys(this.parser.parsedStructureDefinitions);
    return _.chain(keys)
        .filter(function(key) {
            return self.parser.parsedStructureDefinitions[key]._kind === 'resource';
        })
        .value();
}

/**
 * Parses the specified path into a structure
 * @param {string} fhirPath
 * @returns {Array}
 * @private
 */
FhirPath.prototype._parse = function(fhirPath) {
    var statements = [];
    var ns = {};          // newStatement

    var fhirPathSplit = fhirPath.split('.');
    var resourceTypes = this._getResourceTypes();

    if (fhirPathSplit.length > 0 && resourceTypes.indexOf(fhirPathSplit[0]) >= 0) {
        ns.resourceType = fhirPathSplit[0];
        fhirPath = fhirPath.substring(fhirPathSplit[0].length+1);
    }

    for (var i = 0; i < fhirPath.length; i++) {
        var char = fhirPath[i];

        if (char === '\'') {
            if (i === 0) {
                var closingQuoteIndex = findClosingQuoteIndex(fhirPath, i+1);
                ns.value = fhirPath.substring(i+1, closingQuoteIndex);
                i = closingQuoteIndex;
            }
        } else if (char === '(') {
            if (ns.path && ns.path.length > 0) {     // Paren is used for function
                var fn = {
                    name: ns.path.pop().toLowerCase()
                };
                ns.path.push(fn);

                // set the params for the function
                var closingParenIndex = findClosingParenIndex(fhirPath, i+1);
                var fnParams = fhirPath.substring(i+1, closingParenIndex);
                fn.params = this._parse(fnParams);
                i = closingParenIndex;
            }
            // TODO
        } else if (char === '\'') {
            // TODO?
        } else if (char === ' ') {
            // TODO?
        } else if (operators.indexOf(char) >= 0) {
            var left = ns;
            var rightPath = fhirPath.substring(i+1);
            var operator = char;

            // Double-operator
            if (operators.indexOf(rightPath[0]) >= 0) {
                operator += rightPath[0];
                rightPath = rightPath.substring(1);
            }

            ns = {
                left: left,
                right: this._parse(rightPath.trim())[0],           // TODO: Should right ever be an array? Don't think so
                op: operator
            }

            if (ns.left.path && ns.left.path.length > 0) {
                ns.left.path[ns.left.path.length-1] = ns.left.path[ns.left.path.length-1].trim();
            }
            if (ns.right.path && ns.right.path.length > 0) {
                ns.right.path[ns.right.path.length-1] = ns.right.path[ns.right.path.length-1].trim();
            }
            break;
        } else if (char === '.') {
            ns.path.push('');
        } else {
            if (!ns.hasOwnProperty('path')) {
                ns.path = [''];
            }

            ns.path[ns.path.length-1] += char;
        }
    }

    statements.push(ns);

    return statements;
}


FhirPath.prototype._getValue = function(current, paths) {
    if (current === undefined || current == null) {
        return current;
    }

    if (!paths || paths.length === 0) {
        return current;
    }

    var nextPath = paths[0];
    var nextPaths = paths.slice(1);

    if (current instanceof Array) {
        if (typeof nextPath === 'string') {
            var ret = [];

            nextPaths.unshift(nextPath);

            for (var i = 0; i < current.length; i++) {
                var currentRet = this._getValue(current[i], nextPaths);

                if (currentRet instanceof Array) {
                    ret = ret.join(currentRet);
                } else if (currentRet !== undefined && currentRet !== null) {
                    ret.push(currentRet);
                }
            }

            return ret;
        } else if (nextPath.name === 'first') {
            return this._getValue(current[0], nextPaths);
        } else if (nextPath.name === 'last') {
            return this._getValue(current[current.length - 1], nextPaths);
        } else if (nextPath.name === 'where') {
            if (!nextPath.params || !nextPath.params.length === 0) {
                throw new Error('Expected .where() to have a parameter');
            }

            var filtered = [];

            for (var i = 0; i < current.length; i++) {
                var paramsClone = JSON.parse(JSON.stringify(nextPath.params));
                var results = this._evaluate(current[i], paramsClone);

                if (typeof results === 'boolean' && results === true) {
                    filtered.push(current[i]);
                } else if (results instanceof Array && results.length === 1 && results[0]) {
                    filtered.push(current[i]);
                }
            }

            return this._getValue(filtered, nextPaths);
        } else {
            throw new Error('Unsupported function for arrays ' + nextPath.name);
        }
    } else {
        if (typeof nextPath === 'string') {
            return this._getValue(current[nextPath], nextPaths);
        } else if (nextPath.name === 'resolve') {
            var reference = typeof current === 'string' ? current : current.reference;
            var resource = this._resolve(reference);
            return this._getValue(resource, nextPaths);
        } else if (nextPath.name === 'startswith') {
            if (!nextPath.params || nextPath.params.length !== 1) {
                throw new Error('Expected a single parameter to startsWith()');
            }

            if (typeof current !== 'string') {
                throw new Error('startsWith() must be used on string types');
            }

            var paramValue = nextPath.params[0].value || this._getValue(current, nextPath.params[0].path);

            if (!paramValue || current.indexOf(paramValue) !== 0) {
                return false;
            }

            return true;
        } else {
            throw new Error('Unsupported function for objects ' + nextPath.name);
        }
    }
}

/**
 * Evaluates the given statements against the specified single resource.
 * @param {Resource} resource
 * @param statements
 * @returns {*}
 * @private
 */
FhirPath.prototype._evaluate = function(resource, statements) {
    var ret = [];

    for (var i = 0; i < statements.length; i++) {
        var statement = statements[i];

        if (statement.path) {
            statement.value = this._getValue(resource, statement.path);
        }

        if (statement.left && statement.left.path) {
            statement.left.value = this._getValue(resource, statement.left.path);
        }

        if (statement.right && statement.right.path) {
            statement.right.value = this._getValue(resource, statement.right.path);
        }

        if (statement.op) {
            if (!statement.left || !statement.right) {
                return false;
            }

            switch (statement.op) {
                case '=':
                case '==':
                    return statement.left.value === statement.right.value;
                case '!=':
                    return statement.left.value !== statement.right.value;
            }
        } else {
            if (statement.value instanceof Array) {
                ret = ret.concat(statement.value);
            } else {
                ret.push(statement.value);
            }
        }
    }

    return ret;
}

/**
 * Determines if the statements specified should result in an array being returned
 * @param statements
 * @returns {boolean}
 * @private
 */
FhirPath.prototype._shouldReturnArray = function(statements) {
    // TODO: Make this more intelligent.
    // It could instead determine if the last actual path represents
    // an array, based on the definitions stored in ParseConformance class.
    if (statements.length === 1) {
        var statementHasWhereFn = _.filter(statements[0].path, function(nextPath) {
            return nextPath.name === 'where';
        });
        if (statementHasWhereFn.length > 0) {
            return true;
        }
    }

    return false;
}

/**
 * Evaluates the given fhirPath string against the resources passed in the constructor of the class
 * In the event of an operator comparison, returns a boolean
 * In the event of a path evaluation, returns the value of the given path (for each of the resources)
 * @param {string} fhirPath The FhirPath string to evaluate against the resources provided to the FhirPath class
 * @returns {obj|Array} The result of the evaluation. Can be either an object, boolean or array of results
 */
FhirPath.prototype.evaluate = function(fhirPath) {
    if (!fhirPath) {
        return;
    }

    var statements = this._parse(fhirPath);
    var ret = [];

    for (var r = 0; r < this.resources.length; r++) {
        var resource = this.resources[r];
        ret = ret.concat(this._evaluate(resource, statements));
    }

    if (this.resources.length === 1 && ret.length === 1 && !this._shouldReturnArray(statements)) {
        return ret[0];
    }

    return ret;
}

module.exports = FhirPath;