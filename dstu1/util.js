var primitiveTypes = ['Instant', 'Date', 'DateTime', 'Decimal', 'Boolean', 'Integer', 'String', 'Uri', 'Base64Binary', 'Code', 'Id', 'Oid', 'Uuid'];
var choiceTypes = ['Integer', 'Decimal', 'DateTime', 'Date', 'Instant', 'String', 'Uri', 'Boolean', 'Code', 'base64Binary', 'Coding', 'CodeableConcept', 'Attachment', 'Identifier', 'Quantity', 'Range', 'Period', 'Ratio', 'HumanName', 'Address', 'Contact', 'Schedule', 'Resource'];

var util = {
    PrimitiveTypes: primitiveTypes,
    ChoiceTypes: choiceTypes,
    FindElement: function(elementPath, profiles) {
        var elementPathSplit = elementPath.split('.');
        var profile = profiles[elementPathSplit[0]];

        if (elementPathSplit[elementPathSplit.length-1] == 'extension') {
            return {
                path: elementPath,
                definition: {
                    short: 'extension',
                    formal: 'extension',
                    min: 0,
                    max: '*',
                    type: [{
                        code: 'extension'
                    }]
                }
            };
        };

        var profileElementPath = elementPath;
        var elementPathSplit = elementPath.split('.');
        var leafPath = elementPathSplit[elementPathSplit.length-1];
        var selectedChoiceType = null;

        if (util.ChoiceElements[leafPath]) {
            for (var i in choiceTypes) {
                var choiceType = choiceTypes[i];
                var choiceIndex = leafPath.length - choiceType.length;

                if (choiceIndex > 0 && leafPath.indexOf(choiceType) == choiceIndex) {
                    elementPathSplit[elementPathSplit.length-1] = leafPath.substring(0, leafPath.length - choiceType.length) + '[x]';
                    profileElementPath = elementPathSplit.join('.');
                    selectedChoiceType = choiceType;
                    break;
                }
            }
        }

        if (profile) {
            for (var i in profile.structure[0].element) {
                var element = profile.structure[0].element[i];

                if (element.path == profileElementPath) {
                    if (profileElementPath != elementPath && element.definition) {
                        // TODO: Should figure out a better way not to modify the base profile (since JSON.parse/stringify is a little costly)...
                        // Maybe a completely custom return type for FindElement
                        element = JSON.parse(JSON.stringify(element));
                        element.definition.type = [{
                            code: choiceType
                        }] ;
                    }

                    return element;
                }
            }
        }

        return;
    },

    ChoiceElements: {
        "valueBoolean": "boolean",
        "valueInteger": "integer",
        "valueDecimal": "decimal",
        "valueBase64Binary": "base64Binary",
        "valueInstant": "instant",
        "valueString": "string",
        "valueUri": "uri",
        "valueDate": "date",
        "valueDateTime": "dateTime",
        "valueCode": "code",
        "valueAttachment": "Attachment",
        "valueIdentifier": "Identifier",
        "valueCodeableConcept": "CodeableConcept",
        "valueCoding": "Coding",
        "valueQuantity": "Quantity",
        "valueRange": "Range",
        "valuePeriod": "Period",
        "valueRatio": "Ratio",
        "valueResource": "ResourceReference",
        "valueSampledDate": "SampledDate",
        "valueHumanName": "HumanName",
        "valueAddress": "Address",
        "valueContact": "Contact",
        "valueSchedule": "Schedule",
        "timingBoolean": "boolean",
        "timingInteger": "integer",
        "timingDecimal": "decimal",
        "timingBase64Binary": "base64Binary",
        "timingInstant": "instant",
        "timingString": "string",
        "timingUri": "uri",
        "timingDate": "date",
        "timingDateTime": "dateTime",
        "timingCode": "code",
        "timingAttachment": "Attachment",
        "timingIdentifier": "Identifier",
        "timingCodeableConcept": "CodeableConcept",
        "timingCoding": "Coding",
        "timingQuantity": "Quantity",
        "timingRange": "Range",
        "timingPeriod": "Period",
        "timingRatio": "Ratio",
        "timingResource": "ResourceReference",
        "timingSampledDate": "SampledDate",
        "timingHumanName": "HumanName",
        "timingAddress": "Address",
        "timingContact": "Contact",
        "timingSchedule": "Schedule",
        "onsetBoolean": "boolean",
        "onsetInteger": "integer",
        "onsetDecimal": "decimal",
        "onsetBase64Binary": "base64Binary",
        "onsetInstant": "instant",
        "onsetString": "string",
        "onsetUri": "uri",
        "onsetDate": "date",
        "onsetDateTime": "dateTime",
        "onsetCode": "code",
        "onsetAttachment": "Attachment",
        "onsetIdentifier": "Identifier",
        "onsetCodeableConcept": "CodeableConcept",
        "onsetCoding": "Coding",
        "onsetQuantity": "Quantity",
        "onsetRange": "Range",
        "onsetPeriod": "Period",
        "onsetRatio": "Ratio",
        "onsetResource": "ResourceReference",
        "onsetSampledDate": "SampledDate",
        "onsetHumanName": "HumanName",
        "onsetAddress": "Address",
        "onsetContact": "Contact",
        "onsetSchedule": "Schedule",
        "abatementBoolean": "boolean",
        "abatementInteger": "integer",
        "abatementDecimal": "decimal",
        "abatementBase64Binary": "base64Binary",
        "abatementInstant": "instant",
        "abatementString": "string",
        "abatementUri": "uri",
        "abatementDate": "date",
        "abatementDateTime": "dateTime",
        "abatementCode": "code",
        "abatementAttachment": "Attachment",
        "abatementIdentifier": "Identifier",
        "abatementCodeableConcept": "CodeableConcept",
        "abatementCoding": "Coding",
        "abatementQuantity": "Quantity",
        "abatementRange": "Range",
        "abatementPeriod": "Period",
        "abatementRatio": "Ratio",
        "abatementResource": "ResourceReference",
        "abatementSampledDate": "SampledDate",
        "abatementHumanName": "HumanName",
        "abatementAddress": "Address",
        "abatementContact": "Contact",
        "abatementSchedule": "Schedule",
        "diagnosticBoolean": "boolean",
        "diagnosticInteger": "integer",
        "diagnosticDecimal": "decimal",
        "diagnosticBase64Binary": "base64Binary",
        "diagnosticInstant": "instant",
        "diagnosticString": "string",
        "diagnosticUri": "uri",
        "diagnosticDate": "date",
        "diagnosticDateTime": "dateTime",
        "diagnosticCode": "code",
        "diagnosticAttachment": "Attachment",
        "diagnosticIdentifier": "Identifier",
        "diagnosticCodeableConcept": "CodeableConcept",
        "diagnosticCoding": "Coding",
        "diagnosticQuantity": "Quantity",
        "diagnosticRange": "Range",
        "diagnosticPeriod": "Period",
        "diagnosticRatio": "Ratio",
        "diagnosticResource": "ResourceReference",
        "diagnosticSampledDate": "SampledDate",
        "diagnosticHumanName": "HumanName",
        "diagnosticAddress": "Address",
        "diagnosticContact": "Contact",
        "diagnosticSchedule": "Schedule",
        "bornBoolean": "boolean",
        "bornInteger": "integer",
        "bornDecimal": "decimal",
        "bornBase64Binary": "base64Binary",
        "bornInstant": "instant",
        "bornString": "string",
        "bornUri": "uri",
        "bornDate": "date",
        "bornDateTime": "dateTime",
        "bornCode": "code",
        "bornAttachment": "Attachment",
        "bornIdentifier": "Identifier",
        "bornCodeableConcept": "CodeableConcept",
        "bornCoding": "Coding",
        "bornQuantity": "Quantity",
        "bornRange": "Range",
        "bornPeriod": "Period",
        "bornRatio": "Ratio",
        "bornResource": "ResourceReference",
        "bornSampledDate": "SampledDate",
        "bornHumanName": "HumanName",
        "bornAddress": "Address",
        "bornContact": "Contact",
        "bornSchedule": "Schedule",
        "deceasedBoolean": "boolean",
        "deceasedInteger": "integer",
        "deceasedDecimal": "decimal",
        "deceasedBase64Binary": "base64Binary",
        "deceasedInstant": "instant",
        "deceasedString": "string",
        "deceasedUri": "uri",
        "deceasedDate": "date",
        "deceasedDateTime": "dateTime",
        "deceasedCode": "code",
        "deceasedAttachment": "Attachment",
        "deceasedIdentifier": "Identifier",
        "deceasedCodeableConcept": "CodeableConcept",
        "deceasedCoding": "Coding",
        "deceasedQuantity": "Quantity",
        "deceasedRange": "Range",
        "deceasedPeriod": "Period",
        "deceasedRatio": "Ratio",
        "deceasedResource": "ResourceReference",
        "deceasedSampledDate": "SampledDate",
        "deceasedHumanName": "HumanName",
        "deceasedAddress": "Address",
        "deceasedContact": "Contact",
        "deceasedSchedule": "Schedule",
        "asNeededBoolean": "boolean",
        "asNeededInteger": "integer",
        "asNeededDecimal": "decimal",
        "asNeededBase64Binary": "base64Binary",
        "asNeededInstant": "instant",
        "asNeededString": "string",
        "asNeededUri": "uri",
        "asNeededDate": "date",
        "asNeededDateTime": "dateTime",
        "asNeededCode": "code",
        "asNeededAttachment": "Attachment",
        "asNeededIdentifier": "Identifier",
        "asNeededCodeableConcept": "CodeableConcept",
        "asNeededCoding": "Coding",
        "asNeededQuantity": "Quantity",
        "asNeededRange": "Range",
        "asNeededPeriod": "Period",
        "asNeededRatio": "Ratio",
        "asNeededResource": "ResourceReference",
        "asNeededSampledDate": "SampledDate",
        "asNeededHumanName": "HumanName",
        "asNeededAddress": "Address",
        "asNeededContact": "Contact",
        "asNeededSchedule": "Schedule",
        "reasonBoolean": "boolean",
        "reasonInteger": "integer",
        "reasonDecimal": "decimal",
        "reasonBase64Binary": "base64Binary",
        "reasonInstant": "instant",
        "reasonString": "string",
        "reasonUri": "uri",
        "reasonDate": "date",
        "reasonDateTime": "dateTime",
        "reasonCode": "code",
        "reasonAttachment": "Attachment",
        "reasonIdentifier": "Identifier",
        "reasonCodeableConcept": "CodeableConcept",
        "reasonCoding": "Coding",
        "reasonQuantity": "Quantity",
        "reasonRange": "Range",
        "reasonPeriod": "Period",
        "reasonRatio": "Ratio",
        "reasonResource": "ResourceReference",
        "reasonSampledDate": "SampledDate",
        "reasonHumanName": "HumanName",
        "reasonAddress": "Address",
        "reasonContact": "Contact",
        "reasonSchedule": "Schedule",
        "appliesBoolean": "boolean",
        "appliesInteger": "integer",
        "appliesDecimal": "decimal",
        "appliesBase64Binary": "base64Binary",
        "appliesInstant": "instant",
        "appliesString": "string",
        "appliesUri": "uri",
        "appliesDate": "date",
        "appliesDateTime": "dateTime",
        "appliesCode": "code",
        "appliesAttachment": "Attachment",
        "appliesIdentifier": "Identifier",
        "appliesCodeableConcept": "CodeableConcept",
        "appliesCoding": "Coding",
        "appliesQuantity": "Quantity",
        "appliesRange": "Range",
        "appliesPeriod": "Period",
        "appliesRatio": "Ratio",
        "appliesResource": "ResourceReference",
        "appliesSampledDate": "SampledDate",
        "appliesHumanName": "HumanName",
        "appliesAddress": "Address",
        "appliesContact": "Contact",
        "appliesSchedule": "Schedule",
        "authorityBoolean": "boolean",
        "authorityInteger": "integer",
        "authorityDecimal": "decimal",
        "authorityBase64Binary": "base64Binary",
        "authorityInstant": "instant",
        "authorityString": "string",
        "authorityUri": "uri",
        "authorityDate": "date",
        "authorityDateTime": "dateTime",
        "authorityCode": "code",
        "authorityAttachment": "Attachment",
        "authorityIdentifier": "Identifier",
        "authorityCodeableConcept": "CodeableConcept",
        "authorityCoding": "Coding",
        "authorityQuantity": "Quantity",
        "authorityRange": "Range",
        "authorityPeriod": "Period",
        "authorityRatio": "Ratio",
        "authorityResource": "ResourceReference",
        "authoritySampledDate": "SampledDate",
        "authorityHumanName": "HumanName",
        "authorityAddress": "Address",
        "authorityContact": "Contact",
        "authoritySchedule": "Schedule",
        "multipleBirthBoolean": "boolean",
        "multipleBirthInteger": "integer",
        "multipleBirthDecimal": "decimal",
        "multipleBirthBase64Binary": "base64Binary",
        "multipleBirthInstant": "instant",
        "multipleBirthString": "string",
        "multipleBirthUri": "uri",
        "multipleBirthDate": "date",
        "multipleBirthDateTime": "dateTime",
        "multipleBirthCode": "code",
        "multipleBirthAttachment": "Attachment",
        "multipleBirthIdentifier": "Identifier",
        "multipleBirthCodeableConcept": "CodeableConcept",
        "multipleBirthCoding": "Coding",
        "multipleBirthQuantity": "Quantity",
        "multipleBirthRange": "Range",
        "multipleBirthPeriod": "Period",
        "multipleBirthRatio": "Ratio",
        "multipleBirthResource": "ResourceReference",
        "multipleBirthSampledDate": "SampledDate",
        "multipleBirthHumanName": "HumanName",
        "multipleBirthAddress": "Address",
        "multipleBirthContact": "Contact",
        "multipleBirthSchedule": "Schedule",
        "exampleBoolean": "boolean",
        "exampleInteger": "integer",
        "exampleDecimal": "decimal",
        "exampleBase64Binary": "base64Binary",
        "exampleInstant": "instant",
        "exampleString": "string",
        "exampleUri": "uri",
        "exampleDate": "date",
        "exampleDateTime": "dateTime",
        "exampleCode": "code",
        "exampleAttachment": "Attachment",
        "exampleIdentifier": "Identifier",
        "exampleCodeableConcept": "CodeableConcept",
        "exampleCoding": "Coding",
        "exampleQuantity": "Quantity",
        "exampleRange": "Range",
        "examplePeriod": "Period",
        "exampleRatio": "Ratio",
        "exampleResource": "ResourceReference",
        "exampleSampledDate": "SampledDate",
        "exampleHumanName": "HumanName",
        "exampleAddress": "Address",
        "exampleContact": "Contact",
        "exampleSchedule": "Schedule",
        "referenceBoolean": "boolean",
        "referenceInteger": "integer",
        "referenceDecimal": "decimal",
        "referenceBase64Binary": "base64Binary",
        "referenceInstant": "instant",
        "referenceString": "string",
        "referenceUri": "uri",
        "referenceDate": "date",
        "referenceDateTime": "dateTime",
        "referenceCode": "code",
        "referenceAttachment": "Attachment",
        "referenceIdentifier": "Identifier",
        "referenceCodeableConcept": "CodeableConcept",
        "referenceCoding": "Coding",
        "referenceQuantity": "Quantity",
        "referenceRange": "Range",
        "referencePeriod": "Period",
        "referenceRatio": "Ratio",
        "referenceResource": "ResourceReference",
        "referenceSampledDate": "SampledDate",
        "referenceHumanName": "HumanName",
        "referenceAddress": "Address",
        "referenceContact": "Contact",
        "referenceSchedule": "Schedule",
        "answerBoolean": "boolean",
        "answerInteger": "integer",
        "answerDecimal": "decimal",
        "answerBase64Binary": "base64Binary",
        "answerInstant": "instant",
        "answerString": "string",
        "answerUri": "uri",
        "answerDate": "date",
        "answerDateTime": "dateTime",
        "answerCode": "code",
        "answerAttachment": "Attachment",
        "answerIdentifier": "Identifier",
        "answerCodeableConcept": "CodeableConcept",
        "answerCoding": "Coding",
        "answerQuantity": "Quantity",
        "answerRange": "Range",
        "answerPeriod": "Period",
        "answerRatio": "Ratio",
        "answerResource": "ResourceReference",
        "answerSampledDate": "SampledDate",
        "answerHumanName": "HumanName",
        "answerAddress": "Address",
        "answerContact": "Contact",
        "answerSchedule": "Schedule",
        "dataBoolean": "boolean",
        "dataInteger": "integer",
        "dataDecimal": "decimal",
        "dataBase64Binary": "base64Binary",
        "dataInstant": "instant",
        "dataString": "string",
        "dataUri": "uri",
        "dataDate": "date",
        "dataDateTime": "dateTime",
        "dataCode": "code",
        "dataAttachment": "Attachment",
        "dataIdentifier": "Identifier",
        "dataCodeableConcept": "CodeableConcept",
        "dataCoding": "Coding",
        "dataQuantity": "Quantity",
        "dataRange": "Range",
        "dataPeriod": "Period",
        "dataRatio": "Ratio",
        "dataResource": "ResourceReference",
        "dataSampledDate": "SampledDate",
        "dataHumanName": "HumanName",
        "dataAddress": "Address",
        "dataContact": "Contact",
        "dataSchedule": "Schedule",
        "collectedBoolean": "boolean",
        "collectedInteger": "integer",
        "collectedDecimal": "decimal",
        "collectedBase64Binary": "base64Binary",
        "collectedInstant": "instant",
        "collectedString": "string",
        "collectedUri": "uri",
        "collectedDate": "date",
        "collectedDateTime": "dateTime",
        "collectedCode": "code",
        "collectedAttachment": "Attachment",
        "collectedIdentifier": "Identifier",
        "collectedCodeableConcept": "CodeableConcept",
        "collectedCoding": "Coding",
        "collectedQuantity": "Quantity",
        "collectedRange": "Range",
        "collectedPeriod": "Period",
        "collectedRatio": "Ratio",
        "collectedResource": "ResourceReference",
        "collectedSampledDate": "SampledDate",
        "collectedHumanName": "HumanName",
        "collectedAddress": "Address",
        "collectedContact": "Contact",
        "collectedSchedule": "Schedule"
    }
};

module.exports = util;