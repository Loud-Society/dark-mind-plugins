#!/usr/bin/env node
// darkmind-agent 0.18.0+52e644bfaa0d (built 2026-11-26T10:09:21.336Z)
// Local helper for AI agents working on Dark Mind cut projects. Requires Node >= 20 and ffmpeg in PATH.
// Usage: node darkmind-agent.mjs --help
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/cli.ts
import path33 from "node:path";
import { parseArgs } from "node:util";

// src/commands/brand-assets.ts
import { createHash } from "node:crypto";
import { promises as fs3 } from "node:fs";
import os from "node:os";
import path4 from "node:path";

// src/config.ts
import path2 from "node:path";

// src/errors.ts
var CliError = class extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "CliError";
  }
};
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

// src/fsutil.ts
import { promises as fs } from "node:fs";
import path from "node:path";
async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}
async function readJsonFile(file) {
  let text3;
  try {
    text3 = await fs.readFile(file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
  return JSON.parse(text3);
}
async function writeFileAtomic(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temp, content);
  await renameWithRetry(temp, file);
}
async function writeJsonFile(file, value2) {
  await writeFileAtomic(file, `${JSON.stringify(value2, null, 2)}
`);
}
async function renameWithRetry(from, to) {
  for (let attempt = 0; ; attempt++) {
    try {
      await fs.rename(from, to);
      return;
    } catch (error) {
      const code = error.code;
      if (attempt >= 5 || code !== "EPERM" && code !== "EACCES" && code !== "EBUSY") throw error;
      await sleep(100 * (attempt + 1));
    }
  }
}
function toAbsolute(root, manifestPath) {
  return path.join(root, ...manifestPath.split("/"));
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function runPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value2 = bytes;
  let unit = -1;
  do {
    value2 /= 1024;
    unit++;
  } while (value2 >= 1024 && unit < units.length - 1);
  return `${value2.toFixed(value2 >= 100 ? 0 : 1)} ${units[unit]}`;
}

// ../shared/dist/cut-projects/constants.js
var CUT_PROJECT_MANIFEST_SCHEMA_VERSION = 1;
var CUT_PROJECT_FILE_CLASSES = ["text", "generated-media"];
var CUT_PROJECT_MANIFEST_LIMITS = {
  maxFiles: 1e4,
  maxVideoRefs: 1e3,
  maxPathLength: 400,
  maxSegmentLength: 255,
  /** 50 GB, same as the upload limit; size warnings are configured separately. */
  maxFileSize: 53687091200
};
var CUT_PROJECT_LOCAL_STATE_DIR = ".darkmind";

// ../shared/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// ../shared/node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value2) => {
    if (typeof value2 === "bigint") {
      return value2.toString();
    }
    return value2;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// ../shared/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json2 = JSON.stringify(obj, null, 2);
  return json2.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value2) {
    if (!(value2 instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value2}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// ../shared/node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// ../shared/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// ../shared/node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path34, errorMaps, issueData } = params;
  const fullPath = [...path34, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage2 = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage2 = map(fullIssue, { data, defaultError: errorMessage2 }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage2
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status2, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status2.dirty();
      arrayValue.push(s.value);
    }
    return { status: status2.value, value: arrayValue };
  }
  static async mergeObjectAsync(status2, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value2 = await pair.value;
      syncPairs.push({
        key,
        value: value2
      });
    }
    return _ParseStatus.mergeObjectSync(status2, syncPairs);
  }
  static mergeObjectSync(status2, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value: value2 } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value2.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status2.dirty();
      if (value2.status === "dirty")
        status2.dirty();
      if (key.value !== "__proto__" && (typeof value2.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value2.value;
      }
    }
    return { status: status2.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value2) => ({ status: "dirty", value: value2 });
var OK = (value2) => ({ status: "valid", value: value2 });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// ../shared/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// ../shared/node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value2, path34, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value2;
    this._path = path34;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check2, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check2(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check2, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check2(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status2 = new ParseStatus();
    let ctx = void 0;
    for (const check2 of this._def.checks) {
      if (check2.kind === "min") {
        if (input.data.length < check2.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check2.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "max") {
        if (input.data.length > check2.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check2.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "length") {
        const tooBig = input.data.length > check2.value;
        const tooSmall = input.data.length < check2.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check2.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check2.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check2.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check2.message
            });
          }
          status2.dirty();
        }
      } else if (check2.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "regex") {
        check2.regex.lastIndex = 0;
        const testResult = check2.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "trim") {
        input.data = input.data.trim();
      } else if (check2.kind === "includes") {
        if (!input.data.includes(check2.value, check2.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check2.value, position: check2.position },
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check2.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check2.kind === "startsWith") {
        if (!input.data.startsWith(check2.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check2.value },
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "endsWith") {
        if (!input.data.endsWith(check2.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check2.value },
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "datetime") {
        const regex = datetimeRegex(check2);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "time") {
        const regex = timeRegex(check2);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "ip") {
        if (!isValidIP(input.data, check2.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "jwt") {
        if (!isValidJWT(input.data, check2.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "cidr") {
        if (!isValidCidr(input.data, check2.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check2.message
          });
          status2.dirty();
        }
      } else {
        util.assertNever(check2);
      }
    }
    return { status: status2.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check2) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check2]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value2, options) {
    return this._addCheck({
      kind: "includes",
      value: value2,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value2, message) {
    return this._addCheck({
      kind: "startsWith",
      value: value2,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value2, message) {
    return this._addCheck({
      kind: "endsWith",
      value: value2,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status2 = new ParseStatus();
    for (const check2 of this._def.checks) {
      if (check2.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "min") {
        const tooSmall = check2.inclusive ? input.data < check2.value : input.data <= check2.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check2.value,
            type: "number",
            inclusive: check2.inclusive,
            exact: false,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "max") {
        const tooBig = check2.inclusive ? input.data > check2.value : input.data >= check2.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check2.value,
            type: "number",
            inclusive: check2.inclusive,
            exact: false,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check2.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check2.value,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check2.message
          });
          status2.dirty();
        }
      } else {
        util.assertNever(check2);
      }
    }
    return { status: status2.value, value: input.data };
  }
  gte(value2, message) {
    return this.setLimit("min", value2, true, errorUtil.toString(message));
  }
  gt(value2, message) {
    return this.setLimit("min", value2, false, errorUtil.toString(message));
  }
  lte(value2, message) {
    return this.setLimit("max", value2, true, errorUtil.toString(message));
  }
  lt(value2, message) {
    return this.setLimit("max", value2, false, errorUtil.toString(message));
  }
  setLimit(kind, value2, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value: value2,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check2) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check2]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value2, message) {
    return this._addCheck({
      kind: "multipleOf",
      value: value2,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status2 = new ParseStatus();
    for (const check2 of this._def.checks) {
      if (check2.kind === "min") {
        const tooSmall = check2.inclusive ? input.data < check2.value : input.data <= check2.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check2.value,
            inclusive: check2.inclusive,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "max") {
        const tooBig = check2.inclusive ? input.data > check2.value : input.data >= check2.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check2.value,
            inclusive: check2.inclusive,
            message: check2.message
          });
          status2.dirty();
        }
      } else if (check2.kind === "multipleOf") {
        if (input.data % check2.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check2.value,
            message: check2.message
          });
          status2.dirty();
        }
      } else {
        util.assertNever(check2);
      }
    }
    return { status: status2.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value2, message) {
    return this.setLimit("min", value2, true, errorUtil.toString(message));
  }
  gt(value2, message) {
    return this.setLimit("min", value2, false, errorUtil.toString(message));
  }
  lte(value2, message) {
    return this.setLimit("max", value2, true, errorUtil.toString(message));
  }
  lt(value2, message) {
    return this.setLimit("max", value2, false, errorUtil.toString(message));
  }
  setLimit(kind, value2, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value: value2,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check2) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check2]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value2, message) {
    return this._addCheck({
      kind: "multipleOf",
      value: value2,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status2 = new ParseStatus();
    let ctx = void 0;
    for (const check2 of this._def.checks) {
      if (check2.kind === "min") {
        if (input.data.getTime() < check2.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check2.message,
            inclusive: true,
            exact: false,
            minimum: check2.value,
            type: "date"
          });
          status2.dirty();
        }
      } else if (check2.kind === "max") {
        if (input.data.getTime() > check2.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check2.message,
            inclusive: true,
            exact: false,
            maximum: check2.value,
            type: "date"
          });
          status2.dirty();
        }
      } else {
        util.assertNever(check2);
      }
    }
    return {
      status: status2.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check2) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check2]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status: status2 } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status2.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status2.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status2.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status2, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status2, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status: status2, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value2 = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value2, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status2.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value2 = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value2, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value2 = await pair.value;
          syncPairs.push({
            key,
            value: value2,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status2, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status2, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value2 of discriminatorValues) {
        if (optionsMap.has(value2)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value2)}`);
        }
        optionsMap.set(value2, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status: status2, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status2.dirty();
      }
      return { status: status2.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status: status2, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status2.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status2, results);
      });
    } else {
      return ParseStatus.mergeArray(status2, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status: status2, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status2, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status2, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status: status2, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value2], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value2, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value2 = await pair.value;
          if (key.status === "aborted" || value2.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value2.status === "dirty") {
            status2.dirty();
          }
          finalMap.set(key.value, value2.value);
        }
        return { status: status2.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value2 = pair.value;
        if (key.status === "aborted" || value2.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value2.status === "dirty") {
          status2.dirty();
        }
        finalMap.set(key.value, value2.value);
      }
      return { status: status2.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status: status2, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status2.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status2.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status2.dirty();
        parsedSet.add(element.value);
      }
      return { status: status2.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value2, params) => {
  return new ZodLiteral({
    value: value2,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status: status2, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status2.abort();
        } else {
          status2.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status2.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status2.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status2.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status2.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status2.dirty();
        executeRefinement(inner.value);
        return { status: status2.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status2.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status2.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status2.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status2.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status: status2, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status2.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status2.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check2, _params = {}, fatal) {
  if (check2)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check2(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// ../shared/dist/cut-projects/manifest.js
var UUID_PATTERN = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";
var SHA256_PATTERN = "^[0-9a-f]{64}$";
var PATH_PATTERN = '^(?!/)(?!.*//)(?!.*/$)(?!(?:.*/)?\\.{1,2}(?:/|$))[^\\\\<>:"|?*\\u0000-\\u001f\\u007f]+$';
var INVALID_SEGMENT_CHARS = /[\\<>:"|?*\u0000-\u001f\u007f]/;
var RESERVED_NAMES = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
function getCutProjectPathError(path34) {
  if (typeof path34 !== "string" || path34.length === 0)
    return "path is empty";
  if (path34.length > CUT_PROJECT_MANIFEST_LIMITS.maxPathLength) {
    return `path is longer than ${CUT_PROJECT_MANIFEST_LIMITS.maxPathLength} characters`;
  }
  if (path34.normalize("NFC") !== path34)
    return "path is not Unicode NFC normalized";
  if (path34.includes("\\"))
    return 'path must use "/" as separator';
  if (path34.startsWith("/"))
    return "path must be relative";
  const segments = path34.split("/");
  for (const segment of segments) {
    if (segment.length === 0)
      return "path contains an empty segment";
    if (segment === "." || segment === "..")
      return 'path must not contain "." or ".." segments';
    if (segment.length > CUT_PROJECT_MANIFEST_LIMITS.maxSegmentLength) {
      return `path segment is longer than ${CUT_PROJECT_MANIFEST_LIMITS.maxSegmentLength} characters`;
    }
    if (INVALID_SEGMENT_CHARS.test(segment))
      return `"${segment}" contains a character that is invalid on Windows`;
    if (/[. ]$/.test(segment) || segment.startsWith(" ")) {
      return `"${segment}" must not start with a space or end with a space or dot`;
    }
    if (RESERVED_NAMES.test(segment.split(".")[0]))
      return `"${segment}" is a reserved name on Windows`;
  }
  if (segments.length > 1 && segments[0].toLowerCase() === CUT_PROJECT_LOCAL_STATE_DIR) {
    return `files in ${CUT_PROJECT_LOCAL_STATE_DIR}/ are local state and cannot be part of a manifest`;
  }
  return null;
}
var ManifestFileSchema = external_exports.object({
  path: external_exports.string().superRefine((value2, ctx) => {
    const error = getCutProjectPathError(value2);
    if (error)
      ctx.addIssue({ code: external_exports.ZodIssueCode.custom, message: error });
  }),
  sha256: external_exports.string().regex(new RegExp(SHA256_PATTERN), "must be a lowercase hex SHA-256"),
  size: external_exports.number().int().min(0).max(CUT_PROJECT_MANIFEST_LIMITS.maxFileSize),
  class: external_exports.enum(CUT_PROJECT_FILE_CLASSES)
}).strict();
var CutProjectManifestSchema = external_exports.object({
  schemaVersion: external_exports.literal(CUT_PROJECT_MANIFEST_SCHEMA_VERSION),
  projectId: external_exports.string().regex(new RegExp(UUID_PATTERN), "must be a GUID"),
  files: external_exports.array(ManifestFileSchema).max(CUT_PROJECT_MANIFEST_LIMITS.maxFiles),
  videoRefs: external_exports.array(external_exports.string().regex(new RegExp(UUID_PATTERN), "must be a GUID")).max(CUT_PROJECT_MANIFEST_LIMITS.maxVideoRefs)
}).strict().superRefine((manifest, ctx) => {
  const byKey = /* @__PURE__ */ new Map();
  manifest.files.forEach((file, index) => {
    const key = file.path.toLowerCase();
    const first = byKey.get(key);
    if (first !== void 0) {
      ctx.addIssue({
        code: external_exports.ZodIssueCode.custom,
        path: ["files", index, "path"],
        message: `duplicates files[${first}].path (paths are case-insensitive)`
      });
    } else {
      byKey.set(key, index);
    }
  });
  manifest.files.forEach((file, index) => {
    const segments = file.path.toLowerCase().split("/");
    for (let length2 = 1; length2 < segments.length; length2++) {
      const folder = segments.slice(0, length2).join("/");
      const conflict = byKey.get(folder);
      if (conflict !== void 0) {
        ctx.addIssue({
          code: external_exports.ZodIssueCode.custom,
          path: ["files", index, "path"],
          message: `uses files[${conflict}].path as a folder`
        });
        break;
      }
    }
  });
  const refs = /* @__PURE__ */ new Map();
  manifest.videoRefs.forEach((ref, index) => {
    const key = ref.toLowerCase();
    if (refs.has(key)) {
      ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["videoRefs", index], message: `duplicates videoRefs[${refs.get(key)}]` });
    } else {
      refs.set(key, index);
    }
  });
});
function validateCutProjectManifest(value2) {
  const result = CutProjectManifestSchema.safeParse(value2);
  if (result.success)
    return { success: true, manifest: result.data };
  return {
    success: false,
    errors: result.error.issues.map((issue) => {
      const location = issue.path.reduce((text3, part) => typeof part === "number" ? `${text3}[${part}]` : text3 ? `${text3}.${part}` : String(part), "");
      return location ? `${location}: ${issue.message}` : issue.message;
    })
  };
}
function normalizeCutProjectVideoId(videoId) {
  return videoId.trim().toUpperCase();
}
function canonicalizeCutProjectManifest(manifest) {
  const ordinal = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  return {
    schemaVersion: manifest.schemaVersion,
    projectId: manifest.projectId.toLowerCase(),
    files: [...manifest.files].sort((a, b) => ordinal(a.path, b.path)).map((file) => ({ path: file.path, sha256: file.sha256, size: file.size, class: file.class })),
    videoRefs: [...new Set(manifest.videoRefs.map(normalizeCutProjectVideoId))].sort(ordinal)
  };
}
function serializeCutProjectManifest(manifest) {
  return `${JSON.stringify(canonicalizeCutProjectManifest(manifest), null, 2)}
`;
}
function summarizeCutProjectManifest(manifest) {
  const objects = /* @__PURE__ */ new Map();
  let totalBytes = 0;
  let generatedMediaBytes = 0;
  for (const file of manifest.files) {
    totalBytes += file.size;
    if (file.class === "generated-media")
      generatedMediaBytes += file.size;
    objects.set(file.sha256, file.size);
  }
  return {
    fileCount: manifest.files.length,
    totalBytes,
    generatedMediaBytes,
    objectCount: objects.size,
    objectBytes: [...objects.values()].reduce((sum, size) => sum + size, 0)
  };
}
var cutProjectManifestJsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://darkmind.cloud/schemas/cut-project-manifest.v1.json",
  title: "Dark Mind cut project manifest",
  description: 'Files (content-addressed by SHA-256) and used Dark Mind videos of one cut project version. Paths are relative with "/" as separator, Windows-safe, NFC and unique case-insensitively.',
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "projectId", "files", "videoRefs"],
  properties: {
    schemaVersion: { const: CUT_PROJECT_MANIFEST_SCHEMA_VERSION },
    projectId: { type: "string", pattern: UUID_PATTERN },
    files: {
      type: "array",
      maxItems: CUT_PROJECT_MANIFEST_LIMITS.maxFiles,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "sha256", "size", "class"],
        properties: {
          path: {
            type: "string",
            minLength: 1,
            maxLength: CUT_PROJECT_MANIFEST_LIMITS.maxPathLength,
            pattern: PATH_PATTERN
          },
          sha256: { type: "string", pattern: SHA256_PATTERN },
          size: { type: "integer", minimum: 0, maximum: CUT_PROJECT_MANIFEST_LIMITS.maxFileSize },
          class: { type: "string", enum: [...CUT_PROJECT_FILE_CLASSES] }
        }
      }
    },
    videoRefs: {
      type: "array",
      maxItems: CUT_PROJECT_MANIFEST_LIMITS.maxVideoRefs,
      uniqueItems: true,
      items: { type: "string", pattern: UUID_PATTERN }
    }
  }
};

// ../shared/dist/editing-pipeline/constants.js
var EDIT_SCHEMA_VERSION = 1;
var EDIT_PROJECT_KIND = "darkmind-edit-project";
var EDIT_DEFAULT_FILES = {
  project: "project.json",
  sources: "sources.json",
  edit: "edit.json",
  timeline: "timeline.json",
  captions: "captions.json",
  brief: "brief.md",
  toolchain: "toolchain.json",
  /** Phase 3 Explore import (origin "explore-import"); kept unchanged after the local conversion. */
  exploreCutlist: "cutlist.json"
};
var EDIT_FOLDERS = {
  assets: "assets",
  extensions: "extensions",
  reviews: "reviews",
  renders: "renders",
  media: "media",
  localState: ".darkmind"
};
var EDIT_EXTENSION_OUTPUT_FOLDER = "renders/extensions";
var EDIT_SAMPLE_RATE = 48e3;
var EDIT_MAX_FPS = 120;
var EDIT_OUTPUT_PROFILES = {
  "vertical-1080x1920-30": { width: 1080, height: 1920, fps: "30/1", sampleRate: EDIT_SAMPLE_RATE },
  "landscape-1920x1080-25": { width: 1920, height: 1080, fps: "25/1", sampleRate: EDIT_SAMPLE_RATE }
};
var EDIT_REFERENCE_DURATION = { minSeconds: 30, maxSeconds: 60 };
var EDIT_VIDEO_TRACK_ROLES = ["main", "b-roll", "graphics", "overlay"];
var EDIT_AUDIO_TRACK_ROLES = ["dialog", "b-roll", "music", "effects"];
var EDIT_GAP_FILLS = ["black", "silence", "black-and-silence"];
var EDIT_ASSET_ORIGINS = ["generated", "stock", "brand", "recorded", "other"];
var EDIT_RIGHTS_STATUSES = ["cleared", "pending", "unknown"];
var EDIT_RIGHTS_REQUIRED_ORIGINS = ["stock", "other"];
var EDIT_UNRESOLVED_CODES = ["tc-approximate", "quote-unverified", "source-unconfirmed", "placeholder", "other"];
var EDIT_CAPTION_STYLES = ["plain", "brand-word", "brand-phrase", "brand-16x9"];
var EDIT_BRAND_CAPTION_BLOCKS = {
  "brand-word": "caption_word",
  "brand-phrase": "caption_phrase",
  "brand-16x9": "subtitles_16x9"
};
function isBrandCaptionStyle(style) {
  return typeof style === "string" && Object.prototype.hasOwnProperty.call(EDIT_BRAND_CAPTION_BLOCKS, style);
}
var EDIT_CAPTION_MAX_WORDS = 200;
var EDIT_GAIN_LIMITS = { minDb: -96, maxDb: 36 };
var EXPLORE_CUTLIST_CONVERTER_VERSION = 1;
var EDIT_RECIPE_KIND = "darkmind-format-recipe";
var EDIT_RECIPE_LOCK_KIND = "darkmind-recipe-lock";
var EDIT_RECIPE_FILES = { lock: "recipe.lock.json", draft: "recipe.draft.json", material: "material.json" };
var EDIT_RECIPE_SOURCES = ["catalog", "draft"];
var EDIT_RECIPE_ID_PATTERN = "^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$";
var EDIT_RECIPE_MAX_BYTES = 256 * 1024;

// ../shared/dist/editing-pipeline/time.js
var RATIONAL_STRING_PATTERN = "^(?:(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,12})?|(?:0|[1-9][0-9]{0,17})/[1-9][0-9]{0,17})$";
var RATIONAL_REGEX = new RegExp(RATIONAL_STRING_PATTERN);
function gcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b)
    [a, b] = [b, a % b];
  return a;
}
function rational(n, d = 1n) {
  let num3 = BigInt(n);
  let den = BigInt(d);
  if (den === 0n)
    throw new RangeError("rational with denominator 0");
  if (den < 0n)
    [num3, den] = [-num3, -den];
  const g = gcd(num3, den) || 1n;
  return { n: num3 / g, d: den / g };
}
function isRationalString(value2) {
  return typeof value2 === "string" && RATIONAL_REGEX.test(value2);
}
function parseRational(value2) {
  if (!isRationalString(value2))
    throw new RangeError(`"${value2}" is not a rational string`);
  if (value2.includes("/")) {
    const [a, b] = value2.split("/");
    return rational(BigInt(a), BigInt(b));
  }
  const [whole, fraction = ""] = value2.split(".");
  return rational(BigInt(whole + fraction), 10n ** BigInt(fraction.length));
}
function formatRational(value2) {
  return value2.d === 1n ? `${value2.n}` : `${value2.n}/${value2.d}`;
}
function formatRationalReadable(value2, maxDecimals = 6) {
  if (value2.d === 1n)
    return `${value2.n}`;
  for (let decimals = 1; decimals <= maxDecimals; decimals++) {
    const scale = 10n ** BigInt(decimals);
    if (value2.n * scale % value2.d === 0n) {
      const scaled = value2.n * scale / value2.d;
      const negative = scaled < 0n;
      const abs2 = negative ? -scaled : scaled;
      return `${negative ? "-" : ""}${abs2 / scale}.${String(abs2 % scale).padStart(decimals, "0")}`;
    }
  }
  return formatRational(value2);
}
var addQ = (a, b) => rational(a.n * b.d + b.n * a.d, a.d * b.d);
var subQ = (a, b) => rational(a.n * b.d - b.n * a.d, a.d * b.d);
var mulQ = (a, b) => rational(a.n * b.n, a.d * b.d);
var divQ = (a, b) => rational(a.n * b.d, a.d * b.n);
function compareQ(a, b) {
  const x = a.n * b.d - b.n * a.d;
  return x < 0n ? -1 : x > 0n ? 1 : 0;
}
function floorQ(a) {
  const r = a.n / a.d;
  return a.n < 0n && r * a.d !== a.n ? r - 1n : r;
}
function roundHalfUpQ(a) {
  return floorQ(addQ(a, rational(1n, 2n)));
}
function toNumberQ(a) {
  return Number(a.n) / Number(a.d);
}
function rangeFrames(srcIn, srcOut, fps) {
  return roundHalfUpQ(mulQ(subQ(srcOut, srcIn), fps));
}
function executedIn(srcIn, fps) {
  return divQ(rational(roundHalfUpQ(mulQ(srcIn, fps))), fps);
}
function framesToSeconds(frames, fps) {
  return divQ(rational(BigInt(frames)), fps);
}
function srtMillis(frame2, fps) {
  return floorQ(divQ(rational(BigInt(frame2) * 1000n), fps)) + 1n;
}
function srtTimestamp(ms) {
  const v = BigInt(ms);
  const h = v / 3600000n;
  const m = v / 60000n % 60n;
  const s = v / 1000n % 60n;
  const r = v % 1000n;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(r).padStart(3, "0")}`;
}
function frameTimecode(frame2, fps) {
  const rate = fps.n / fps.d;
  const f = BigInt(frame2);
  const totalSeconds = f / rate;
  const h = totalSeconds / 3600n;
  const m = totalSeconds / 60n % 60n;
  const s = totalSeconds % 60n;
  return [h, m, s, f % rate].map((part) => String(part).padStart(2, "0")).join(":");
}

// ../shared/dist/editing-pipeline/schemas.js
var EDIT_ID_PATTERN = "^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$";
var GUID_PATTERN = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";
var SHA256_PATTERN2 = "^[0-9a-f]{64}$";
var PATH_PATTERN2 = '^(?!/)(?!.*//)(?!.*/$)(?!(?:.*/)?\\.{1,2}(?:/|$))[^\\\\<>:"|?*\\u0000-\\u001f\\u007f]+$';
var schemaRef = external_exports.string().max(500).optional().describe("Optional JSON Schema reference for editors; ignored by the validator.");
var id = external_exports.string().regex(new RegExp(EDIT_ID_PATTERN), 'must be an ID of letters, digits, ".", "_" or "-" (max. 64, starting with a letter or digit)');
var rationalString = external_exports.string().regex(new RegExp(RATIONAL_STRING_PATTERN), 'must be an exact rational string such as "12.48", "15" or "1/3" (no number, sign or exponent)');
var text = (max) => external_exports.string().max(max);
var nullableText = (max) => external_exports.string().max(max).nullable();
var frame = external_exports.number().int("must be a whole frame").min(0).max(Number.MAX_SAFE_INTEGER);
var positiveInt = external_exports.number().int().min(1).max(1e5);
var sha256 = external_exports.string().regex(new RegExp(SHA256_PATTERN2), "must be a lowercase hex SHA-256");
var editPathSchema = external_exports.string().min(1).max(400).regex(new RegExp(PATH_PATTERN2), 'must be a relative path with "/" separators and no "." or ".." segments').superRefine((value2, ctx) => {
  const error = getCutProjectPathError(value2);
  if (error)
    ctx.addIssue({ code: external_exports.ZodIssueCode.custom, message: error });
});
var editRangeSchema = external_exports.object({
  in: rationalString.describe("Source in-point in seconds from the start of the original (inclusive)"),
  out: rationalString.describe("Source out-point in seconds from the start of the original (exclusive)")
}).strict();
var editCropSchema = external_exports.object({
  x: rationalString,
  y: rationalString,
  w: rationalString,
  h: rationalString
}).strict().describe("Normalised rectangle (0..1) in the correctly oriented source image with the output aspect ratio (rule G1)");
var editOutputSchema = external_exports.object({
  width: external_exports.number().int().min(16).max(7680).multipleOf(2, "must be even"),
  height: external_exports.number().int().min(16).max(7680).multipleOf(2, "must be even"),
  fps: rationalString.describe('Whole frame rate such as "30/1" or "25"; NTSC rates are not supported in v1'),
  sampleRate: external_exports.literal(48e3)
}).strict();
var editProjectSchema = external_exports.object({
  $schema: schemaRef,
  schemaVersion: external_exports.literal(EDIT_SCHEMA_VERSION),
  kind: external_exports.literal(EDIT_PROJECT_KIND),
  title: external_exports.string().min(1).max(200),
  output: editOutputSchema,
  duration: external_exports.object({ minSeconds: external_exports.number().min(0).max(86400), maxSeconds: external_exports.number().min(0).max(86400) }).strict().nullable().optional().describe("Duration frame; outside it the validator warns (F8, explicit exception in the review, no truncation)"),
  recipe: external_exports.object({
    id: external_exports.string().regex(new RegExp(EDIT_RECIPE_ID_PATTERN), 'must be a recipe slug (lowercase letters, digits, "-")'),
    version: external_exports.number().int().min(1).nullable().describe('Published catalog version; null for a local draft (source "draft")'),
    sha256: sha256.describe("SHA-256 of the canonical recipe in recipe.lock.json"),
    source: external_exports.enum(EDIT_RECIPE_SOURCES)
  }).strict().nullable().optional().describe("Format recipe the project is built with (frozen in recipe.lock.json, written by darkmind-agent recipe)"),
  audioMaster: external_exports.object({
    integratedLufs: external_exports.number().min(-40).max(-5).describe("Target integrated loudness of the whole program (EBU R128), e.g. -14"),
    toleranceLu: external_exports.number().min(0.1).max(3).describe("Allowed deviation of the measured result (the render check fails outside)"),
    truePeakDbtp: external_exports.number().min(-9).max(0).describe("Maximum true peak, e.g. -1"),
    ducking: external_exports.object({
      underDialogDb: external_exports.number().min(0).max(40).describe("Music tracks are lowered by this many dB while a dialog clip plays"),
      rampSeconds: external_exports.number().min(0).max(2).describe("Length of the fade into and out of the ducked level")
    }).strict().nullable().optional()
  }).strict().nullable().optional().describe("Final loudness step of the renderer (Phase 6 audio_master): two-pass loudnorm over the whole mix, optional music ducking"),
  artifacts: external_exports.object({
    sources: editPathSchema,
    edit: editPathSchema,
    timeline: editPathSchema,
    captions: editPathSchema,
    brief: editPathSchema.optional(),
    toolchain: editPathSchema.optional()
  }).strict(),
  extensions: external_exports.array(editPathSchema).max(500).default([]).describe("Paths of extension.json files under extensions/"),
  origin: external_exports.object({
    kind: external_exports.literal("explore-cutlist"),
    file: editPathSchema,
    sha256,
    converterVersion: external_exports.number().int().min(1),
    importedAt: external_exports.string().max(40)
  }).strict().nullable().optional(),
  notes: nullableText(2e4).optional()
}).strict();
var editMediaFactsSchema = external_exports.object({
  durationSeconds: rationalString,
  video: external_exports.object({
    width: positiveInt.describe("Display width of the correctly oriented image (rotation applied)"),
    height: positiveInt.describe("Display height of the correctly oriented image (rotation applied)"),
    rotation: external_exports.number().int().refine((value2) => value2 % 90 === 0 && Math.abs(value2) <= 270, "must be a multiple of 90 between -270 and 270"),
    frameRate: rationalString.nullable().describe("Nominal frame rate (r_frame_rate); not used for VFR sources"),
    vfr: external_exports.boolean(),
    sampleAspectRatio: external_exports.string().regex(/^[1-9][0-9]*:[1-9][0-9]*$/, 'must look like "1:1"'),
    colorTransfer: nullableText(40),
    colorPrimaries: nullableText(40),
    colorSpace: nullableText(40).optional(),
    codec: text(40).optional(),
    pixelFormat: text(40).optional(),
    alpha: external_exports.boolean().optional()
  }).strict().nullable(),
  audio: external_exports.object({
    sampleRate: external_exports.number().int().min(1).max(768e3),
    channels: external_exports.number().int().min(1).max(64),
    codec: text(40).optional()
  }).strict().nullable(),
  probedFrom: external_exports.enum(["original", "asset"]).optional(),
  probedAt: external_exports.string().max(40).optional()
}).strict().describe("ffprobe facts of the original (or the asset file); decide conform need (C1) and colour gate (C2)");
var sourceBase = {
  id,
  label: nullableText(200).optional(),
  media: editMediaFactsSchema.nullable().optional(),
  notes: nullableText(2e3).optional(),
  rights: external_exports.object({
    holder: text(200).describe("Rights holder (person, company, library)"),
    license: text(200).describe('Licence or agreement, e.g. "CC0", "Artlist standard", "written permission 2026-11-02"'),
    status: external_exports.enum(EDIT_RIGHTS_STATUSES).describe("cleared = usable in the final render and export; pending/unknown block them"),
    scope: nullableText(400).optional().describe("Where the material may be used (platforms, territories, duration)"),
    source: nullableText(400).optional().describe("Where the material comes from (URL, delivery, archive)")
  }).strict().optional().describe('Rights of third-party material (Phase 6 T14): required for asset origins "stock" and "other"; final render and export block unless "cleared"')
};
var editDarkMindVideoSourceSchema = external_exports.object({
  ...sourceBase,
  kind: external_exports.literal("darkmind-video"),
  videoId: external_exports.string().regex(new RegExp(GUID_PATTERN), "must be a Dark Mind video ID (GUID)"),
  fileName: nullableText(400).optional(),
  original: external_exports.object({ size: external_exports.number().int().min(0).optional(), sha256: sha256.optional() }).strict().nullable().optional().describe("Identity of the downloaded original (size, SHA-256); a changed original needs a new source revision")
}).strict();
var editAssetSourceSchema = external_exports.object({
  ...sourceBase,
  kind: external_exports.literal("asset"),
  path: editPathSchema.describe("File under assets/ (synced with the project; AI media as generated-media)"),
  sha256,
  size: external_exports.number().int().min(0),
  origin: external_exports.enum(EDIT_ASSET_ORIGINS),
  provenance: nullableText(2e3).optional()
}).strict();
var editSourceSchema = external_exports.discriminatedUnion("kind", [editDarkMindVideoSourceSchema, editAssetSourceSchema]);
var editSourcesSchema = external_exports.object({
  $schema: schemaRef,
  schemaVersion: external_exports.literal(EDIT_SCHEMA_VERSION),
  sources: external_exports.array(editSourceSchema).max(2e3)
}).strict();
var exploreOriginSchema = external_exports.object({
  kind: external_exports.literal("explore-cutlist"),
  clipNumber: external_exports.number().nullable(),
  type: nullableText(100),
  sourceFile: nullableText(1e3),
  sourceVideoId: nullableText(200),
  segmentId: nullableText(400),
  tcIn: nullableText(40),
  tcOut: nullableText(40),
  durationSeconds: external_exports.number().nullable(),
  tcApproximate: external_exports.boolean(),
  transcriptQuote: nullableText(2e4),
  contentDescription: nullableText(2e4),
  overlayText: nullableText(2e4),
  editorialNotes: nullableText(2e4),
  speakerName: nullableText(400),
  speakerRole: nullableText(400)
}).strict().describe("Unchanged values of the Explore cutlist clip this item was imported from (research values, not cut points)");
var unresolved = external_exports.array(external_exports.enum(EDIT_UNRESOLVED_CODES)).max(10).default([]).describe("Open points the agent resolves at the material before the editorial review");
var editStatementSchema = external_exports.object({
  kind: external_exports.literal("statement"),
  id,
  sourceId: id.nullable(),
  range: editRangeSchema.nullable(),
  quote: nullableText(5e3).describe("What is said in the range, verbatim; never invented"),
  context: text(5e3).describe("Why the statement is used and what surrounds it in the original"),
  speaker: external_exports.object({ name: nullableText(200), role: nullableText(200) }).strict().nullable().optional(),
  notes: nullableText(5e3).optional(),
  unresolved,
  origin: exploreOriginSchema.nullable().optional()
}).strict();
var editSceneSchema = external_exports.object({
  kind: external_exports.literal("scene"),
  id,
  description: text(5e3),
  text: nullableText(5e3).describe("Text shown or spoken in the scene; part of the editorial review"),
  extensionId: id.nullable(),
  unresolved,
  origin: exploreOriginSchema.nullable().optional()
}).strict();
var editBrollSchema = external_exports.object({
  id,
  sourceId: id.nullable(),
  range: editRangeSchema.nullable(),
  description: text(5e3),
  afterId: id.nullable().optional().describe("Sequence item the B-roll illustrates or follows"),
  unresolved,
  origin: exploreOriginSchema.nullable().optional()
}).strict();
var editDraftSchema = external_exports.object({
  $schema: schemaRef,
  schemaVersion: external_exports.literal(EDIT_SCHEMA_VERSION),
  sequence: external_exports.array(external_exports.discriminatedUnion("kind", [editStatementSchema, editSceneSchema])).max(2e3).describe("Statements and free scenes in the proposed order"),
  broll: external_exports.array(editBrollSchema).max(2e3).default([]),
  notes: nullableText(2e4).optional()
}).strict();
var clipBase = {
  id,
  sourceId: id.optional(),
  extensionId: id.optional(),
  statementId: id.optional(),
  brollId: id.optional(),
  sceneId: id.optional(),
  in: rationalString.describe("Source in-point (seconds); for extension clips seconds from the start of the rendered output"),
  out: rationalString,
  start: frame.describe("Timeline start in whole frames")
};
var editVideoClipSchema = external_exports.object({
  ...clipBase,
  crop: editCropSchema.optional()
}).strict();
var editAudioClipSchema = external_exports.object({
  ...clipBase,
  gainDb: external_exports.number().min(EDIT_GAIN_LIMITS.minDb).max(EDIT_GAIN_LIMITS.maxDb),
  linkedTo: id.optional().describe("Video clip with the same source range and position (linked in Premiere)")
}).strict();
var editTimelineSchema = external_exports.object({
  $schema: schemaRef,
  schemaVersion: external_exports.literal(EDIT_SCHEMA_VERSION),
  video: external_exports.array(external_exports.object({ id, role: external_exports.enum(EDIT_VIDEO_TRACK_ROLES), clips: external_exports.array(editVideoClipSchema).max(5e3) }).strict()).max(32).describe("Video tracks, bottom to top (array order is the stacking order)"),
  audio: external_exports.array(external_exports.object({ id, role: external_exports.enum(EDIT_AUDIO_TRACK_ROLES), clips: external_exports.array(editAudioClipSchema).max(5e3) }).strict()).max(32),
  gaps: external_exports.array(external_exports.object({ start: frame, end: frame, fill: external_exports.enum(EDIT_GAP_FILLS), reason: nullableText(500).optional() }).strict()).max(1e3).default([]).describe("Intended black/silent ranges; every other uncovered frame is an error")
}).strict();
var editCaptionSchema = external_exports.object({
  id,
  start: frame,
  end: frame,
  text: external_exports.string().min(1).max(500),
  statementId: id.optional(),
  sceneId: id.optional(),
  words: external_exports.array(external_exports.object({
    text: external_exports.string().min(1).max(100),
    start: frame,
    end: frame,
    emphasis: external_exports.boolean().optional().describe("Keyword pop of the brand word captions (agent choice, part of the caption text review)")
  }).strict()).max(EDIT_CAPTION_MAX_WORDS).optional().describe("Optional word timings in timeline frames (Phase 6 word captions, rule W1)")
}).strict();
var editCaptionsSchema = external_exports.object({
  $schema: schemaRef,
  schemaVersion: external_exports.literal(EDIT_SCHEMA_VERSION),
  language: external_exports.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/, 'must be a language tag such as "en" or "de-DE"'),
  style: external_exports.enum(EDIT_CAPTION_STYLES).default("plain").describe("plain: burnt in by the renderer, SRT for Premiere; brand-*: rendered by the brand caption block as an overlay (Phase 6, T8)"),
  captions: external_exports.array(editCaptionSchema).max(1e4)
}).strict();
var editExtensionSchema = external_exports.object({
  $schema: schemaRef,
  schemaVersion: external_exports.literal(EDIT_SCHEMA_VERSION),
  id,
  version: external_exports.string().min(1).max(40),
  description: text(2e3),
  sceneId: id.nullable().optional(),
  inputs: external_exports.array(external_exports.discriminatedUnion("kind", [
    external_exports.object({ kind: external_exports.literal("source"), sourceId: id }).strict(),
    external_exports.object({ kind: external_exports.literal("file"), path: editPathSchema }).strict(),
    external_exports.object({ kind: external_exports.literal("extension"), extensionId: id }).strict()
  ])).max(500).describe("Every input the command reads, including its scripts; undeclared inputs make the result non-reproducible"),
  parameters: external_exports.record(external_exports.unknown()).optional(),
  command: external_exports.object({ program: external_exports.string().min(1).max(400), args: external_exports.array(external_exports.string().max(4e3)).max(500) }).strict().describe("Local command as program plus argument list (no shell); runs only after explicit local approval"),
  tools: external_exports.array(external_exports.object({ name: external_exports.string().min(1).max(100), version: external_exports.string().max(100).optional() }).strict()).max(50).default([]),
  output: external_exports.object({
    path: editPathSchema.describe("Rendered file under renders/extensions/ (written by the command, checked with ffprobe)"),
    durationFrames: external_exports.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
    width: external_exports.number().int().min(2).max(7680),
    height: external_exports.number().int().min(2).max(7680),
    fps: rationalString,
    audio: external_exports.boolean(),
    alpha: external_exports.boolean(),
    video: external_exports.boolean().optional().describe("false = audio-only output (e.g. WAV; Phase 6 audio blocks): no video stream, audio required, alpha false; durationFrames still counts frames at fps (the project rate). Default true"),
    image: external_exports.boolean().optional().describe('true = still image (PNG; Phase 6 thumbnail): a deliverable next to the video, not a clip \u2013 exactly one frame (durationFrames 1), no audio, width/height of the image (independent of the project size), never placed on the timeline and not part of the preview review (own review "thumbnail"; parameters.candidates marks a contact sheet of proposals, which cannot be approved). Default false')
  }).strict().superRefine((out, ctx) => {
    if (out.image) {
      if (out.video === false)
        ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["video"], message: "a still image (image: true) has a picture; video must not be false" });
      if (out.audio)
        ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["audio"], message: "a still image (image: true) has no audio" });
      if (out.durationFrames !== 1)
        ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["durationFrames"], message: "a still image (image: true) is exactly one frame (durationFrames 1)" });
      if (!out.path.toLowerCase().endsWith(".png"))
        ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["path"], message: "a still image (image: true) is a PNG: the path must end with .png" });
      return;
    }
    if (out.video !== false)
      return;
    if (!out.audio)
      ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["audio"], message: "an audio-only output (video: false) must declare audio: true" });
    if (out.alpha)
      ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["alpha"], message: "an audio-only output (video: false) has no alpha" });
  })
}).strict();
var editToolchainSchema = external_exports.object({
  $schema: schemaRef,
  schemaVersion: external_exports.literal(EDIT_SCHEMA_VERSION),
  pipeline: external_exports.object({ name: external_exports.string().min(1).max(100), version: external_exports.string().min(1).max(100) }).strict(),
  skill: external_exports.object({ version: external_exports.string().min(1).max(100) }).strict().nullable().optional(),
  brandPack: external_exports.object({ id, version: external_exports.string().min(1).max(100) }).strict().nullable().optional(),
  tools: external_exports.array(external_exports.object({ name: external_exports.string().min(1).max(100), version: external_exports.string().min(1).max(400), features: external_exports.array(external_exports.string().max(100)).max(200).optional() }).strict()).max(100)
}).strict();
var EDIT_ARTIFACT_SCHEMAS = {
  project: editProjectSchema,
  sources: editSourcesSchema,
  edit: editDraftSchema,
  timeline: editTimelineSchema,
  captions: editCaptionsSchema,
  extension: editExtensionSchema,
  toolchain: editToolchainSchema
};

// ../shared/dist/editing-pipeline/media.js
function assessConform(facts) {
  const reasons = [];
  if (facts.video?.vfr)
    reasons.push("vfr");
  if (facts.video && facts.video.rotation % 360 !== 0)
    reasons.push("rotation");
  return { needed: reasons.length > 0, reasons };
}
var HDR_TRANSFERS = /* @__PURE__ */ new Set(["smpte2084", "arib-std-b67", "smpte428"]);
var UNSIGNALLED = /* @__PURE__ */ new Set(["", "unknown", "unspecified", "reserved"]);
function assessColor(facts) {
  const video = facts.video;
  if (!video)
    return { status: "sdr" };
  const transfer = (video.colorTransfer ?? "").toLowerCase();
  const primaries = (video.colorPrimaries ?? "").toLowerCase();
  if (HDR_TRANSFERS.has(transfer)) {
    return { status: "unsupported", message: `HDR transfer "${transfer}" is not supported (no verified SDR conversion); convert the source to SDR BT.709 first` };
  }
  if (primaries === "bt2020")
    return { status: "unsupported", message: "BT.2020 primaries are not supported (no verified SDR path)" };
  if (UNSIGNALLED.has(transfer))
    return { status: "assumed-bt709", message: "colour transfer is not signalled; treated as SDR BT.709" };
  return { status: "sdr" };
}
function parseCrop(crop) {
  return { x: parseRational(crop.x), y: parseRational(crop.y), w: parseRational(crop.w), h: parseRational(crop.h) };
}
function getCropBoundsError(crop) {
  const one = rational(1);
  const zero = rational(0);
  for (const field of ["x", "y", "w", "h"]) {
    if (compareQ(crop[field], one) > 0)
      return { field, message: "must be between 0 and 1" };
  }
  if (compareQ(crop.w, zero) <= 0)
    return { field: "w", message: "must be greater than 0" };
  if (compareQ(crop.h, zero) <= 0)
    return { field: "h", message: "must be greater than 0" };
  if (compareQ(addQ(crop.x, crop.w), one) > 0)
    return { field: "w", message: "x + w leaves the source image" };
  if (compareQ(addQ(crop.y, crop.h), one) > 0)
    return { field: "h", message: "y + h leaves the source image" };
  return null;
}
function cropGeometry(crop, srcWidth, srcHeight, outWidth, outHeight) {
  const scale = divQ(rational(outHeight), mulQ(crop.h, rational(srcHeight)));
  const s = toNumberQ(scale);
  const offsetX = Math.round(toNumberQ(mulQ(mulQ(crop.x, rational(srcWidth)), scale)));
  const offsetY = Math.round(toNumberQ(mulQ(mulQ(crop.y, rational(srcHeight)), scale)));
  const positionX = srcWidth * s / 2 - offsetX;
  const positionY = srcHeight * s / 2 - offsetY;
  return {
    scale,
    derivedWidth: toNumberQ(mulQ(mulQ(crop.w, rational(srcWidth)), scale)),
    scaledWidth: Math.round(srcWidth * s),
    scaledHeight: Math.round(srcHeight * s),
    offsetX,
    offsetY,
    premiere: {
      scalePercent: s * 100,
      positionX,
      positionY,
      centerX: (positionX - outWidth / 2) / srcWidth,
      centerY: (positionY - outHeight / 2) / srcHeight
    }
  };
}
function getCropAspectError(crop, srcWidth, srcHeight, outWidth, outHeight) {
  const geometry = cropGeometry(crop, srcWidth, srcHeight, outWidth, outHeight);
  if (Math.abs(geometry.derivedWidth - outWidth) <= 0.5)
    return null;
  const exact2 = divQ(mulQ(mulQ(rational(outWidth), crop.h), rational(srcHeight)), rational(outHeight * srcWidth));
  return `rectangle is ${geometry.derivedWidth.toFixed(1)} instead of ${outWidth} output pixels wide (aspect of ${srcWidth}x${srcHeight} source does not match ${outWidth}:${outHeight}); for h = ${crop.h.n}/${crop.h.d} use w = "${exact2.n}/${exact2.d}"`;
}

// ../shared/dist/editing-pipeline/review.js
var EDIT_REVIEW_SUBJECTS = ["editorial", "captions-text", "preview", "duration-exception", "final", "thumbnail"];
var EDIT_REVIEW_DECISIONS = ["approved", "changes-requested"];
var EDIT_REVIEW_CONFIRMATIONS = ["terminal", "relayed"];
var EDIT_REVIEW_RECORD_KIND = "darkmind-review";
var EDIT_REVIEW_PROJECTION_VERSION = 1;
function canonicalize(value2) {
  if (Array.isArray(value2))
    return value2.map((item) => item === void 0 ? null : canonicalize(item));
  if (value2 !== null && typeof value2 === "object") {
    const result = {};
    for (const key of Object.keys(value2).sort()) {
      const item = value2[key];
      if (item !== void 0)
        result[key] = canonicalize(item);
    }
    return result;
  }
  return value2;
}
function canonicalJson(value2) {
  return JSON.stringify(canonicalize(value2));
}
var exact = (value2) => formatRational(parseRational(value2));
function toolchainBinding(document) {
  if (!document?.tools)
    return null;
  const version = (name) => document.tools.find((tool) => tool.name === name)?.version ?? null;
  return { ffmpeg: version("ffmpeg"), captionFont: version("caption-font") };
}
function sourceIdentity(documents, sourceId) {
  if (sourceId === null)
    return null;
  const source = documents.sources?.sources.find((entry) => entry.id === sourceId);
  if (!source)
    return { kind: "unknown" };
  return source.kind === "darkmind-video" ? { kind: "darkmind-video", videoId: normalizeCutProjectVideoId(source.videoId) } : { kind: "asset", sha256: source.sha256 };
}
function editorialProjection(documents) {
  const edit = documents.edit;
  if (!edit)
    return null;
  return {
    kind: "editorial",
    version: EDIT_REVIEW_PROJECTION_VERSION,
    sequence: edit.sequence.map((item) => item.kind === "statement" ? {
      kind: "statement",
      id: item.id,
      sourceId: item.sourceId,
      source: sourceIdentity(documents, item.sourceId),
      range: item.range ? { in: exact(item.range.in), out: exact(item.range.out) } : null,
      quote: item.quote,
      context: item.context,
      speaker: item.speaker ? { name: item.speaker.name, role: item.speaker.role } : null
    } : { kind: "scene", id: item.id, description: item.description, text: item.text }),
    broll: Object.fromEntries(edit.broll.map((item) => [item.id, { sourceId: item.sourceId, source: sourceIdentity(documents, item.sourceId), description: item.description, afterId: item.afterId ?? null }]))
  };
}
var byTimelineOrder = (a, b) => a.start - b.start || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
function captionsTextProjection(documents) {
  const captions = documents.captions;
  if (!captions || captions.captions.length === 0)
    return null;
  return {
    kind: "captions-text",
    version: EDIT_REVIEW_PROJECTION_VERSION,
    language: captions.language,
    captions: [...captions.captions].sort(byTimelineOrder).map((c) => {
      const emphasis = (c.words ?? []).filter((word) => word.emphasis).map((word) => word.text);
      return { id: c.id, text: c.text, statementId: c.statementId ?? null, sceneId: c.sceneId ?? null, ...emphasis.length ? { emphasis } : {} };
    })
  };
}
function normalizeClip(clip) {
  const result = { ...clip, in: exact(String(clip.in)), out: exact(String(clip.out)) };
  const crop = clip.crop;
  if (crop)
    result.crop = { x: exact(crop.x), y: exact(crop.y), w: exact(crop.w), h: exact(crop.h) };
  return result;
}
function usedSourceIds(timeline, extensions) {
  const ids = /* @__PURE__ */ new Set();
  for (const track of [...timeline?.video ?? [], ...timeline?.audio ?? []])
    for (const clip of track.clips)
      if (clip.sourceId)
        ids.add(clip.sourceId);
  for (const extension of extensions)
    for (const input of extension.inputs)
      if (input.kind === "source")
        ids.add(input.sourceId);
  return ids;
}
function previewProjection(documents, input) {
  const { project, timeline } = documents;
  if (!timeline)
    return null;
  const videoExtensions = documents.extensions.filter((extension) => extension.output.image !== true);
  const used = usedSourceIds(timeline, videoExtensions);
  const sources = {};
  for (const source of documents.sources?.sources ?? []) {
    if (!used.has(source.id))
      continue;
    const media = source.media ? { ...source.media, probedAt: void 0 } : null;
    sources[source.id] = source.kind === "darkmind-video" ? { kind: source.kind, videoId: normalizeCutProjectVideoId(source.videoId), media } : { kind: source.kind, path: source.path, sha256: source.sha256, size: source.size, media };
  }
  const clips = {};
  const tracks = { video: [], audio: [] };
  for (const kind of ["video", "audio"]) {
    for (const track of timeline[kind]) {
      tracks[kind].push({ id: track.id, role: track.role, clips: track.clips.map((clip) => clip.id) });
      for (const clip of track.clips)
        clips[clip.id] = { track: track.id, ...normalizeClip(clip) };
    }
  }
  const captions = documents.captions;
  const extensions = {};
  for (const extension of videoExtensions) {
    const files = {};
    for (const item of extension.inputs)
      if (item.kind === "file")
        files[item.path] = input.files[item.path] ?? null;
    extensions[extension.id] = { definition: { ...extension, $schema: void 0 }, files };
  }
  return {
    kind: "preview",
    version: EDIT_REVIEW_PROJECTION_VERSION,
    output: project.output,
    recipe: project.recipe ?? null,
    editorial: input.editorial,
    captionsText: input.captionsText,
    sources,
    tracks,
    clips,
    gaps: [...timeline.gaps].sort((a, b) => a.start - b.start),
    captions: captions ? {
      style: captions.style,
      timing: Object.fromEntries(captions.captions.map((c) => [c.id, { start: c.start, end: c.end, words: c.words ?? null }]))
    } : null,
    extensions,
    toolchain: input.toolchain
  };
}
function durationOutOfRange(documents, totalFrames) {
  const frame2 = documents.project.duration;
  if (!frame2)
    return false;
  const seconds2 = toNumberQ(framesToSeconds(totalFrames, parseRational(documents.project.output.fps)));
  return seconds2 < frame2.minSeconds || seconds2 > frame2.maxSeconds;
}
function durationExceptionProjection(documents, totalFrames, previewHash) {
  const frame2 = documents.project.duration;
  if (!frame2 || totalFrames === null || previewHash === null || !durationOutOfRange(documents, totalFrames))
    return null;
  const fps = parseRational(documents.project.output.fps);
  return {
    kind: "duration-exception",
    version: EDIT_REVIEW_PROJECTION_VERSION,
    frames: totalFrames,
    fps: formatRational(fps),
    seconds: formatRational(framesToSeconds(totalFrames, fps)),
    minSeconds: frame2.minSeconds,
    maxSeconds: frame2.maxSeconds,
    preview: previewHash
  };
}
function finalProjection(render, bindings) {
  return {
    kind: "final",
    version: EDIT_REVIEW_PROJECTION_VERSION,
    output: render.output,
    sha256: render.sha256,
    size: render.size,
    frames: render.frames,
    renderKey: render.renderKey,
    preview: bindings.preview,
    editorial: bindings.editorial,
    captionsText: bindings.captionsText
  };
}
function stillImageExtensions(extensions) {
  return extensions.filter((extension) => extension.output.image === true);
}
function thumbnailProjection(documents, input) {
  const stills = stillImageExtensions(documents.extensions);
  if (!stills.length)
    return null;
  const result = {};
  for (const extension of stills) {
    const files = {};
    const sources = {};
    for (const item of extension.inputs) {
      if (item.kind === "file")
        files[item.path] = input.files[item.path] ?? null;
      if (item.kind === "source")
        sources[item.sourceId] = sourceIdentity(documents, item.sourceId);
    }
    result[extension.id] = { definition: { ...extension, $schema: void 0 }, files, sources };
  }
  return { kind: "thumbnail", version: EDIT_REVIEW_PROJECTION_VERSION, stills: result };
}
function timelineDraftMismatches(documents) {
  const { edit, timeline } = documents;
  if (!edit || !timeline)
    return [];
  const mismatches = [];
  const statements = edit.sequence.filter((item) => item.kind === "statement");
  const byId = new Map(statements.map((item) => [item.id, item]));
  const dialog = timeline.audio.filter((track) => track.role === "dialog").flatMap((track) => track.clips);
  const used = /* @__PURE__ */ new Map();
  const order = [];
  for (const clip of [...dialog].sort(byTimelineOrder)) {
    if (!clip.statementId) {
      mismatches.push({ code: "dialog-without-statement", ref: clip.id, message: `dialog clip "${clip.id}" references no statement of edit.json` });
      continue;
    }
    const statement = byId.get(clip.statementId);
    if (!statement) {
      mismatches.push({ code: "unknown-statement", ref: clip.id, message: `dialog clip "${clip.id}" references "${clip.statementId}", which is not a statement of edit.json` });
      continue;
    }
    if (used.has(statement.id)) {
      mismatches.push({ code: "statement-reused", ref: clip.id, message: `statement "${statement.id}" is used by dialog clips "${used.get(statement.id)}" and "${clip.id}"` });
      continue;
    }
    used.set(statement.id, clip.id);
    order.push(statement.id);
    const range2 = statement.range;
    if (clip.sourceId !== statement.sourceId || !range2 || compareQ(parseRational(clip.in), parseRational(range2.in)) !== 0 || compareQ(parseRational(clip.out), parseRational(range2.out)) !== 0) {
      mismatches.push({
        code: "statement-binding",
        ref: clip.id,
        message: `dialog clip "${clip.id}" plays ${clip.sourceId ?? "?"} ${clip.in}\u2013${clip.out} s, statement "${statement.id}" is ${statement.sourceId ?? "?"} ${range2 ? `${range2.in}\u2013${range2.out} s` : "(no range)"}`
      });
    }
  }
  for (const statement of statements) {
    if (!used.has(statement.id))
      mismatches.push({ code: "statement-missing", ref: statement.id, message: `statement "${statement.id}" has no dialog clip in the timeline` });
  }
  const expected = statements.map((item) => item.id).filter((id2) => used.has(id2));
  if (expected.join("\0") !== order.join("\0")) {
    mismatches.push({ code: "statement-order", message: `dialog order ${order.join(", ")} differs from the draft order ${expected.join(", ")}` });
  }
  return mismatches;
}
function diffProjections(before, after, max = 200) {
  const changes = [];
  const walk2 = (a, b, path34) => {
    if (changes.length >= max)
      return;
    const objectA = a !== null && typeof a === "object" && !Array.isArray(a);
    const objectB = b !== null && typeof b === "object" && !Array.isArray(b);
    if (objectA && objectB) {
      const keys = [.../* @__PURE__ */ new Set([...Object.keys(a), ...Object.keys(b)])].sort();
      for (const key of keys)
        walk2(a[key], b[key], path34 ? `${path34}.${key}` : key);
      return;
    }
    if (canonicalJson(a ?? null) !== canonicalJson(b ?? null))
      changes.push({ path: path34, before: a ?? null, after: b ?? null });
  };
  walk2(before, after, "");
  return changes;
}
function wordDiff(before, after) {
  const a = before.split(/\s+/).filter(Boolean);
  const b = after.split(/\s+/).filter(Boolean);
  const table = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i2 = a.length - 1; i2 >= 0; i2--)
    for (let j2 = b.length - 1; j2 >= 0; j2--)
      table[i2][j2] = a[i2] === b[j2] ? table[i2 + 1][j2 + 1] + 1 : Math.max(table[i2 + 1][j2], table[i2][j2 + 1]);
  const parts = [];
  const removed = [];
  const added = [];
  const flush = () => {
    if (removed.length)
      parts.push(`[-${removed.splice(0).join(" ")}-]`);
    if (added.length)
      parts.push(`{+${added.splice(0).join(" ")}+}`);
  };
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      flush();
      parts.push(a[i]);
      i++;
      j++;
    } else if (j < b.length && (i >= a.length || table[i][j + 1] >= table[i + 1][j]))
      added.push(b[j++]);
    else
      removed.push(a[i++]);
  }
  flush();
  return parts.join(" ");
}
function itemChanges(kind, before, after, text3) {
  const changes = [];
  for (const [id2, item] of before)
    if (!after.has(id2))
      changes.push({ change: "removed", id: id2, kind, before: item });
  for (const [id2, item] of after) {
    if (!before.has(id2)) {
      changes.push({ change: "added", id: id2, kind, after: item });
      continue;
    }
    const fields = diffProjections(before.get(id2), item);
    if (!fields.length)
      continue;
    const oldText = text3?.(before.get(id2)) ?? null;
    const newText = text3?.(item) ?? null;
    changes.push({ change: "changed", id: id2, kind, fields, ...oldText !== null && newText !== null && oldText !== newText ? { textDiff: wordDiff(oldText, newText) } : {} });
  }
  return changes;
}
function orderChange(before, after) {
  const common = new Set(before.filter((id2) => after.includes(id2)));
  const a = before.filter((id2) => common.has(id2));
  const b = after.filter((id2) => common.has(id2));
  return a.join("\0") === b.join("\0") ? null : { change: "order", before, after };
}
function diffEditorial(before, after) {
  const textOf = (item) => {
    const value2 = item;
    return (value2.kind === "statement" ? value2.quote : value2.text) ?? null;
  };
  const changes = [
    ...itemChanges("statement", new Map(before.sequence.filter((i) => i.kind === "statement").map((i) => [i.id, i])), new Map(after.sequence.filter((i) => i.kind === "statement").map((i) => [i.id, i])), textOf),
    ...itemChanges("scene", new Map(before.sequence.filter((i) => i.kind === "scene").map((i) => [i.id, i])), new Map(after.sequence.filter((i) => i.kind === "scene").map((i) => [i.id, i])), textOf),
    ...itemChanges("broll", new Map(Object.entries(before.broll)), new Map(Object.entries(after.broll)))
  ];
  const order = orderChange(before.sequence.map((i) => i.id), after.sequence.map((i) => i.id));
  return order ? [...changes, order] : changes;
}
function diffCaptionsText(before, after) {
  const changes = itemChanges("caption", new Map(before.captions.map((c) => [c.id, c])), new Map(after.captions.map((c) => [c.id, c])), (item) => item.text);
  if (before.language !== after.language)
    changes.push({ change: "changed", kind: "language", before: before.language, after: after.language });
  const order = orderChange(before.captions.map((c) => c.id), after.captions.map((c) => c.id));
  return order ? [...changes, order] : changes;
}
var sha2562 = external_exports.string().regex(/^[0-9a-f]{64}$/, "must be a lowercase hex SHA-256");
var editReviewRecordSchema = external_exports.object({
  $schema: external_exports.string().max(500).optional(),
  schemaVersion: external_exports.literal(EDIT_SCHEMA_VERSION),
  kind: external_exports.literal(EDIT_REVIEW_RECORD_KIND),
  id: external_exports.string().regex(new RegExp(EDIT_ID_PATTERN)),
  subject: external_exports.enum(EDIT_REVIEW_SUBJECTS),
  decision: external_exports.enum(EDIT_REVIEW_DECISIONS),
  hash: sha2562.describe("SHA-256 of the canonical JSON of snapshot; binds the decision to exactly this state"),
  snapshot: external_exports.record(external_exports.unknown()).describe("Reviewed projection (subject content); basis of the change analysis"),
  render: external_exports.object({
    report: editPathSchema,
    output: editPathSchema,
    sha256: sha2562,
    mode: external_exports.enum(["proxy", "original"]),
    renderKey: external_exports.string().min(1).max(200),
    frames: external_exports.number().int().min(0)
  }).strict().nullable().describe("Rendered file the editor viewed (preview, final)"),
  reviewer: external_exports.object({ name: external_exports.string().min(1).max(200) }).strict(),
  confirmation: external_exports.object({
    method: external_exports.enum(EDIT_REVIEW_CONFIRMATIONS),
    statement: external_exports.string().min(1).max(5e3).nullable().describe("Verbatim confirmation of the editor (relayed)")
  }).strict().describe("Origin of the explicit confirmation of the editor; never an autonomous decision of the agent"),
  comment: external_exports.string().max(5e3).nullable(),
  createdAt: external_exports.string().max(40),
  tool: external_exports.object({ name: external_exports.string().min(1).max(100), version: external_exports.string().min(1).max(100) }).strict()
}).strict().superRefine((record, ctx) => {
  if (record.confirmation.method === "relayed" && !record.confirmation.statement) {
    ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["confirmation", "statement"], message: "a relayed confirmation needs the verbatim statement of the editor" });
  }
  if ((record.subject === "preview" || record.subject === "final") && record.decision === "approved" && !record.render) {
    ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["render"], message: `an approved ${record.subject} review names the rendered file` });
  }
  if (record.snapshot.kind !== record.subject) {
    ctx.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["snapshot", "kind"], message: `must be "${record.subject}"` });
  }
});

// ../shared/dist/editing-pipeline/recipe.js
var EDIT_RECIPE_MATERIAL_KINDS = ["interview", "question", "answer", "b-roll", "selfie", "still", "music", "other"];
var EDIT_RECIPE_LEVELS = ["hard", "recommended"];
var EDIT_RECIPE_ORIGINS = ["concept", "project", "migration"];
var BLOCK_PATTERN = "^[a-z0-9_]{1,40}$";
var ITEM_PATTERN = "^[a-z0-9][a-z0-9-]{0,39}$";
var GUID_PATTERN2 = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";
var slug = external_exports.string().regex(new RegExp(EDIT_RECIPE_ID_PATTERN), 'must be a recipe slug (lowercase letters, digits, "-", max. 40)');
var block = external_exports.string().regex(new RegExp(BLOCK_PATTERN), 'must be a block name (lowercase letters, digits, "_")');
var itemId = external_exports.string().regex(new RegExp(ITEM_PATTERN), 'must be an ID of lowercase letters, digits and "-" (max. 40)');
var text2 = (max) => external_exports.string().min(1).max(max);
var count = external_exports.number().int().min(0).max(1e3);
var seconds = external_exports.number().min(0).max(86400);
var editRecipeBlockSchema = external_exports.object({
  use: external_exports.enum(["required", "optional"]),
  min: count.optional().describe("Minimum uses in the whole video (default 1 for required blocks)"),
  max: count.optional().describe("Maximum uses in the whole video"),
  still: external_exports.boolean().optional().describe("Still image next to the video (thumbnail), never on a track"),
  parameters: external_exports.object({ required: external_exports.array(external_exports.string().min(1).max(60)).max(30) }).strict().optional(),
  role: text2(500).optional().describe("What the block does in this format")
}).strict();
var editRecipeSectionSchema = external_exports.object({
  id: itemId,
  title: text2(200),
  purpose: text2(2e3),
  duration: external_exports.object({ minSeconds: seconds.optional(), targetSeconds: seconds.optional(), maxSeconds: seconds.optional() }).strict().optional().describe("Guide values for the agent; the check counts the whole video only"),
  blocks: external_exports.array(block).max(30).default([]),
  material: external_exports.array(itemId).max(30).default([]),
  notes: external_exports.array(text2(2e3)).max(30).default([])
}).strict();
var machineCheck = external_exports.object({
  kind: external_exports.literal("machine"),
  id: itemId.describe("Check of the brand pack catalog"),
  params: external_exports.record(external_exports.union([external_exports.string().max(200), external_exports.number(), external_exports.boolean(), external_exports.array(external_exports.string().max(200)).max(30)])).default({})
}).strict();
var editorialCheck = external_exports.object({ kind: external_exports.literal("editorial") }).strict();
var editRecipeSchema = external_exports.object({
  $schema: external_exports.string().max(500).optional(),
  schemaVersion: external_exports.literal(EDIT_SCHEMA_VERSION),
  kind: external_exports.literal(EDIT_RECIPE_KIND),
  meta: external_exports.object({
    id: slug,
    title: text2(200),
    summary: text2(500).describe("One or two sentences for the catalog list and the recipe choice"),
    tags: external_exports.array(external_exports.string().min(1).max(40)).max(20).default([])
  }).strict(),
  brand: external_exports.object({
    pack: external_exports.string().regex(new RegExp(ITEM_PATTERN)).describe("Brand pack id, e.g. loud-society"),
    versions: external_exports.string().min(1).max(100).describe('Compatible brand pack versions, e.g. ">=0.7.0 <1.0.0" or "^0.7.0"')
  }).strict(),
  concept: external_exports.object({
    idea: text2(4e3),
    audience: text2(1e3).optional(),
    tone: text2(1e3).optional(),
    platforms: external_exports.array(external_exports.string().min(1).max(60)).max(10).default([]),
    references: external_exports.array(external_exports.object({ videoId: external_exports.string().regex(new RegExp(GUID_PATTERN2)).optional(), url: external_exports.string().url().max(500).optional(), note: text2(500) }).strict()).max(20).default([])
  }).strict(),
  briefing: external_exports.array(external_exports.object({ id: itemId, question: text2(500), required: external_exports.boolean() }).strict()).max(30).default([]).describe("Questions the agent asks when the recipe is chosen; the answers go into brief.md"),
  material: external_exports.array(external_exports.object({
    id: itemId,
    label: text2(200),
    kind: external_exports.enum(EDIT_RECIPE_MATERIAL_KINDS),
    level: external_exports.enum(EDIT_RECIPE_LEVELS),
    min: count.optional(),
    max: count.optional(),
    description: text2(2e3).optional(),
    hints: text2(1e3).optional()
  }).strict()).max(50).default([]),
  structure: external_exports.object({
    sections: external_exports.array(editRecipeSectionSchema).min(1).max(40),
    blocks: external_exports.record(block, editRecipeBlockSchema),
    groups: external_exports.array(external_exports.object({ id: itemId, oneOf: external_exports.array(block).min(2).max(10), note: text2(500).optional() }).strict()).max(10).default([]),
    order: external_exports.array(block).max(30).default([]).describe("Order of the first appearance of these blocks"),
    hook: external_exports.object({
      untilBlock: block.optional().describe("The hook lasts until this block first appears"),
      untilSeconds: external_exports.number().positive().max(600).optional().describe("\u2026or for this many seconds"),
      forbidden: external_exports.array(block).max(20),
      note: text2(500).optional()
    }).strict().nullable().default(null),
    endsWith: block.nullable().default(null)
  }).strict(),
  technical: external_exports.object({
    profile: external_exports.string().regex(new RegExp(ITEM_PATTERN)).describe("Output profile of the brand pack (vertical, landscape)"),
    duration: external_exports.object({
      minSeconds: seconds,
      maxSeconds: seconds,
      reference: external_exports.object({ minSeconds: seconds, maxSeconds: seconds, note: text2(500) }).strict().optional()
    }).strict(),
    captions: external_exports.object({
      styles: external_exports.array(external_exports.enum(EDIT_CAPTION_STYLES)).max(4),
      required: external_exports.boolean(),
      default: external_exports.union([external_exports.enum(EDIT_CAPTION_STYLES), external_exports.literal("none")]),
      note: text2(1e3).optional()
    }).strict(),
    music: external_exports.object({ slot: external_exports.enum(["optional", "none"]), note: text2(1e3).optional() }).strict(),
    deliverables: external_exports.object({
      thumbnail: external_exports.boolean(),
      chapters: external_exports.object({
        required: external_exports.boolean(),
        derive: block.nullable().describe("Block that starts a chapter (band_card) or null for chapters.json"),
        introTitle: text2(100).optional(),
        note: text2(1e3).optional()
      }).strict().nullable(),
      titleSuffix: external_exports.string().min(1).max(100).optional()
    }).strict()
  }).strict(),
  rules: external_exports.array(external_exports.object({ id: itemId, text: text2(2e3), level: external_exports.enum(EDIT_RECIPE_LEVELS), check: external_exports.discriminatedUnion("kind", [machineCheck, editorialCheck]) }).strict()).max(60).default([]),
  review: external_exports.object({
    done: external_exports.array(external_exports.enum(EDIT_REVIEW_SUBJECTS)).min(1).max(EDIT_REVIEW_SUBJECTS.length).describe("Reviews the editor approves before the video is finished"),
    report: external_exports.array(text2(1e3)).max(20).default([]).describe("What the review report of the agent must contain")
  }).strict(),
  capabilities: external_exports.array(itemId).max(10).default([]).describe("Capabilities of the brand pack, e.g. nei-chain"),
  provenance: external_exports.object({
    origin: external_exports.enum(EDIT_RECIPE_ORIGINS),
    concept: external_exports.object({ title: text2(300) }).strict().optional(),
    sourceProject: external_exports.object({ projectId: external_exports.string().regex(new RegExp(GUID_PATTERN2)), version: external_exports.number().int().min(1).nullable() }).strict().optional(),
    testProjects: external_exports.array(external_exports.object({ projectId: external_exports.string().regex(new RegExp(GUID_PATTERN2)), version: external_exports.number().int().min(1).nullable(), note: text2(500).optional() }).strict()).max(20).default([])
  }).strict().optional()
}).strict();
var editRecipeLockSchema = external_exports.object({
  $schema: external_exports.string().max(500).optional(),
  schemaVersion: external_exports.literal(EDIT_SCHEMA_VERSION),
  kind: external_exports.literal(EDIT_RECIPE_LOCK_KIND),
  slug,
  version: external_exports.number().int().min(1).nullable().describe("Published catalog version; null for a draft"),
  sha256: external_exports.string().regex(/^[0-9a-f]{64}$/),
  source: external_exports.enum(EDIT_RECIPE_SOURCES),
  publishedAt: external_exports.string().max(40).nullable(),
  brandPack: external_exports.object({ id: external_exports.string().min(1).max(64), version: external_exports.string().min(1).max(40) }).strict().nullable().describe("Brand pack the recipe was applied with"),
  lockedAt: external_exports.string().max(40),
  recipe: editRecipeSchema
}).strict();
var EDIT_MATERIAL_KIND = "darkmind-material";
var EDIT_MATERIAL_STATUSES = ["covered", "partial", "missing", "waived"];
var editMaterialSchema = external_exports.object({
  $schema: external_exports.string().max(500).optional(),
  schemaVersion: external_exports.literal(EDIT_SCHEMA_VERSION),
  kind: external_exports.literal(EDIT_MATERIAL_KIND),
  needs: external_exports.array(external_exports.object({
    needId: itemId.describe("ID of a material need of the recipe"),
    status: external_exports.enum(EDIT_MATERIAL_STATUSES).describe("covered, partial, missing, or waived (the editor decided to go without)"),
    sources: external_exports.array(external_exports.string().min(1).max(64)).max(200).default([]).describe("IDs of sources.json that cover the need"),
    statements: external_exports.array(external_exports.string().min(1).max(64)).max(200).default([]).describe("IDs of edit.json statements that cover the need"),
    note: external_exports.string().max(2e3).optional().describe("What is missing, or why the editor waived it")
  }).strict()).max(100)
}).strict();
function canonicalRecipeJson(recipe) {
  const { $schema: _schema, ...rest } = recipe;
  return canonicalJson(rest);
}
function classifyRecipeChange(previous, next) {
  const same = (a, b) => canonicalJson(a) === canonicalJson(b);
  const kinds = [];
  if (!same(previous.technical, next.technical) || !same(previous.brand, next.brand))
    kinds.push("technical");
  const machine = (s) => ({ blocks: s.blocks, groups: s.groups, order: s.order, hook: s.hook, endsWith: s.endsWith });
  if (!same(machine(previous.structure), machine(next.structure)) || !same(previous.review.done, next.review.done))
    kinds.push("structure");
  const level = (recipe, wanted) => ({
    rules: recipe.rules.filter((r) => r.level === wanted),
    material: recipe.material.filter((m) => m.level === wanted)
  });
  if (!same(level(previous, "hard"), level(next, "hard")))
    kinds.push("hard-rules");
  if (!same(level(previous, "recommended"), level(next, "recommended")))
    kinds.push("recommendations");
  if (!kinds.length && canonicalRecipeJson(previous) !== canonicalRecipeJson(next))
    kinds.push("text");
  return kinds;
}
function parseVersion(value2) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(value2.trim());
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}
var compareVersions = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
function parseRange(range2) {
  const parts = range2.trim().split(/\s+/).filter(Boolean);
  if (!parts.length)
    return null;
  const comparators = [];
  for (const part of parts) {
    const match = /^(\^|>=|<=|>|<|=)?(.+)$/.exec(part);
    const version = match ? parseVersion(match[2]) : null;
    if (!match || !version)
      return null;
    const op = match[1] ?? "=";
    if (op === "^") {
      const upper = version[0] > 0 ? [version[0] + 1, 0, 0] : version[1] > 0 ? [0, version[1] + 1, 0] : [0, 0, version[2] + 1];
      comparators.push({ op: ">=", version }, { op: "<", version: upper });
    } else
      comparators.push({ op, version });
  }
  return comparators;
}
function isVersionRange(range2) {
  return parseRange(range2) !== null;
}
function satisfiesVersionRange(version, range2) {
  const v = parseVersion(version);
  const comparators = parseRange(range2);
  if (!v || !comparators)
    return false;
  return comparators.every(({ op, version: c }) => {
    const d = compareVersions(v, c);
    return op === ">=" ? d >= 0 : op === ">" ? d > 0 : op === "<=" ? d <= 0 : op === "<" ? d < 0 : d === 0;
  });
}
function zodPath(path34) {
  return path34.map((part, i) => typeof part === "number" ? `[${part}]` : i === 0 ? part : `.${part}`).join("");
}
function duplicates(values) {
  const seen = /* @__PURE__ */ new Set();
  return [...new Set(values.filter((value2) => seen.has(value2) || !seen.add(value2)))];
}
function validateRecipe(document, catalog) {
  const parsed = editRecipeSchema.safeParse(document);
  if (!parsed.success) {
    return { valid: false, recipe: null, issues: parsed.error.issues.map((issue) => ({ path: zodPath(issue.path), code: "recipe-schema", message: issue.message })) };
  }
  const recipe = parsed.data;
  const issues = [];
  const add = (path34, code, message) => issues.push({ path: path34, code, message });
  const { structure, technical } = recipe;
  const blocks = structure.blocks;
  const known = (name) => Object.prototype.hasOwnProperty.call(blocks, name);
  if (new TextEncoder().encode(canonicalRecipeJson(recipe)).length > EDIT_RECIPE_MAX_BYTES)
    add("", "recipe-too-large", `the recipe is larger than ${EDIT_RECIPE_MAX_BYTES / 1024} KB`);
  if (!isVersionRange(recipe.brand.versions))
    add("brand.versions", "recipe-brand-range", `"${recipe.brand.versions}" is no version range (e.g. ">=0.7.0 <1.0.0" or "^0.7.0")`);
  for (const [list2, values] of [
    ["structure.sections", structure.sections.map((s) => s.id)],
    ["material", recipe.material.map((m) => m.id)],
    ["briefing", recipe.briefing.map((b) => b.id)],
    ["rules", recipe.rules.map((r) => r.id)],
    ["structure.groups", structure.groups.map((g) => g.id)]
  ]) {
    for (const dup of duplicates([...values]))
      add(list2, "recipe-duplicate-id", `ID "${dup}" is used more than once`);
  }
  for (const [name, spec] of Object.entries(blocks)) {
    if (spec.min !== void 0 && spec.max !== void 0 && spec.min > spec.max)
      add(`structure.blocks.${name}`, "recipe-block-count", "min is greater than max");
    if (spec.use === "optional" && spec.min !== void 0 && spec.min > 0)
      add(`structure.blocks.${name}`, "recipe-block-count", "an optional block has no minimum");
  }
  const materialIds = new Set(recipe.material.map((m) => m.id));
  structure.sections.forEach((section, i) => {
    for (const name of section.blocks)
      if (!known(name))
        add(`structure.sections[${i}].blocks`, "recipe-block-unlisted", `"${name}" is not in structure.blocks`);
    for (const need of section.material)
      if (!materialIds.has(need))
        add(`structure.sections[${i}].material`, "recipe-material-unknown", `"${need}" is no material need of the recipe`);
    const d = section.duration;
    if (d?.minSeconds !== void 0 && d.maxSeconds !== void 0 && d.minSeconds > d.maxSeconds)
      add(`structure.sections[${i}].duration`, "recipe-duration", "minSeconds is greater than maxSeconds");
  });
  for (const name of structure.order)
    if (!known(name))
      add("structure.order", "recipe-block-unlisted", `"${name}" is not in structure.blocks`);
  for (const dup of duplicates(structure.order))
    add("structure.order", "recipe-duplicate-id", `"${dup}" appears twice`);
  if (structure.endsWith && !known(structure.endsWith))
    add("structure.endsWith", "recipe-block-unlisted", `"${structure.endsWith}" is not in structure.blocks`);
  structure.groups.forEach((group, i) => {
    for (const name of group.oneOf)
      if (!known(name))
        add(`structure.groups[${i}].oneOf`, "recipe-block-unlisted", `"${name}" is not in structure.blocks`);
  });
  const hook = structure.hook;
  if (hook) {
    if (hook.untilBlock === void 0 === (hook.untilSeconds === void 0))
      add("structure.hook", "recipe-hook", "the hook needs exactly one of untilBlock and untilSeconds");
    if (hook.untilBlock && !known(hook.untilBlock))
      add("structure.hook.untilBlock", "recipe-block-unlisted", `"${hook.untilBlock}" is not in structure.blocks`);
  }
  if (technical.duration.minSeconds >= technical.duration.maxSeconds)
    add("technical.duration", "recipe-duration", "minSeconds must be smaller than maxSeconds");
  const ref = technical.duration.reference;
  if (ref && ref.minSeconds > ref.maxSeconds)
    add("technical.duration.reference", "recipe-duration", "minSeconds is greater than maxSeconds");
  const captions = technical.captions;
  if (captions.required && !captions.styles.length)
    add("technical.captions", "recipe-captions", "required captions need at least one style");
  if (captions.default !== "none" && !captions.styles.includes(captions.default))
    add("technical.captions.default", "recipe-captions", `"${captions.default}" is not one of the styles`);
  const chapters2 = technical.deliverables.chapters;
  if (chapters2?.derive && !known(chapters2.derive))
    add("technical.deliverables.chapters.derive", "recipe-block-unlisted", `"${chapters2.derive}" is not in structure.blocks`);
  const stillBlocks = Object.entries(blocks).filter(([, spec]) => spec.still).map(([name]) => name);
  if (technical.deliverables.thumbnail !== stillBlocks.some((name) => blocks[name].use === "required")) {
    add("technical.deliverables.thumbnail", "recipe-thumbnail", "deliverables.thumbnail must match a required still block (thumbnail) in structure.blocks");
  }
  recipe.material.forEach((need, i) => {
    if (need.min !== void 0 && need.max !== void 0 && need.min > need.max)
      add(`material[${i}]`, "recipe-material-count", "min is greater than max");
  });
  if (catalog) {
    if (recipe.brand.pack !== catalog.brand.id)
      add("brand.pack", "recipe-brand-pack", `the recipe is made for brand pack "${recipe.brand.pack}", this is "${catalog.brand.id}"`);
    else if (isVersionRange(recipe.brand.versions) && !satisfiesVersionRange(catalog.brand.version, recipe.brand.versions)) {
      add("brand.versions", "recipe-brand-incompatible", `brand pack ${catalog.brand.version} is outside the recipe's range "${recipe.brand.versions}"`);
    }
    const profile = catalog.profiles[technical.profile];
    if (!profile)
      add("technical.profile", "recipe-unknown-profile", `unknown profile "${technical.profile}" (brand pack: ${Object.keys(catalog.profiles).join(", ")})`);
    for (const [name, spec] of Object.entries(blocks)) {
      const entry = catalog.blocks[name];
      if (!entry) {
        add(`structure.blocks.${name}`, "recipe-unknown-block", `unknown block "${name}" (not in brand pack ${catalog.brand.version})`);
        continue;
      }
      if (entry.still !== Boolean(spec.still))
        add(`structure.blocks.${name}.still`, "recipe-block-still", `still must be ${entry.still} for ${name}`);
      if (profile && entry.profiles && !entry.profiles.includes(technical.profile))
        add(`structure.blocks.${name}`, "recipe-block-profile", `${name} is made for ${entry.profiles.join("/")}, the recipe renders ${technical.profile}`);
    }
    for (const style of captions.styles)
      if (!catalog.captionStyles.includes(style))
        add("technical.captions.styles", "recipe-captions", `caption style "${style}" is not offered by the brand pack`);
    if (chapters2?.derive && !catalog.chapterDerivations.includes(chapters2.derive))
      add("technical.deliverables.chapters.derive", "recipe-chapters", `chapters cannot be derived from "${chapters2.derive}" (brand pack: ${catalog.chapterDerivations.join(", ") || "none"})`);
    recipe.rules.forEach((rule, i) => {
      if (rule.check.kind !== "machine")
        return;
      const check2 = catalog.checks[rule.check.id];
      if (!check2) {
        add(`rules[${i}].check.id`, "recipe-unknown-check", `unknown check "${rule.check.id}" (brand pack: ${Object.keys(catalog.checks).join(", ") || "none"}); new checks come with a brand pack release`);
        return;
      }
      for (const key of Object.keys(rule.check.params))
        if (!Object.prototype.hasOwnProperty.call(check2.params, key))
          add(`rules[${i}].check.params.${key}`, "recipe-check-params", `check ${rule.check.id} has no parameter "${key}"`);
    });
    for (const capability of recipe.capabilities)
      if (!catalog.capabilities[capability])
        add("capabilities", "recipe-unknown-capability", `unknown capability "${capability}" (brand pack: ${Object.keys(catalog.capabilities).join(", ") || "none"})`);
  }
  return { valid: issues.length === 0, recipe, issues };
}
var cell = (value2) => value2.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
var list = (values) => values.map((v) => `\`${v}\``).join(", ");
var range = (min, max) => min !== void 0 && max !== void 0 ? min === max ? `${min}` : `${min}\u2013${max}` : min !== void 0 ? `\u2265 ${min}` : max !== void 0 ? `\u2264 ${max}` : "\u2013";
function formatSeconds(value2) {
  if (value2 >= 120 && value2 % 60 === 0)
    return `${value2 / 60} min`;
  return `${value2} s`;
}
function renderRecipeMarkdown(recipe, meta = { version: null }, catalog) {
  const out = [];
  const { structure, technical } = recipe;
  out.push(`# Recipe \`${recipe.meta.id}\` \u2013 ${recipe.meta.title}`, "", recipe.meta.summary, "");
  const version = meta.version === null ? "local draft" : `version ${meta.version}${meta.publishedAt ? ` (published ${meta.publishedAt})` : ""}`;
  out.push(`${version}${meta.sha256 ? ` \xB7 SHA-256 \`${meta.sha256.slice(0, 12)}\u2026\`` : ""} \xB7 brand pack \`${recipe.brand.pack}\` ${recipe.brand.versions}${recipe.meta.tags.length ? ` \xB7 tags: ${recipe.meta.tags.join(", ")}` : ""}`, "");
  out.push("> The recipe is the base pattern of the format. Deviations the editor asks for are allowed and expected \u2013 the", "> recipe check reports them (`deviation`). The limits of the brand pack (brand layer, loudness) are never broken.", "");
  out.push("## Concept", "", recipe.concept.idea, "");
  if (recipe.concept.audience)
    out.push(`- **Audience:** ${recipe.concept.audience}`);
  if (recipe.concept.tone)
    out.push(`- **Tone:** ${recipe.concept.tone}`);
  if (recipe.concept.platforms.length)
    out.push(`- **Platforms:** ${recipe.concept.platforms.join(", ")}`);
  for (const ref of recipe.concept.references)
    out.push(`- **Reference:** ${ref.note}${ref.videoId ? ` (Dark Mind video ${ref.videoId})` : ""}${ref.url ? ` \u2013 ${ref.url}` : ""}`);
  if (recipe.concept.audience || recipe.concept.tone || recipe.concept.platforms.length || recipe.concept.references.length)
    out.push("");
  const profile = catalog?.profiles[technical.profile];
  out.push("## Technical", "", "| | |", "|---|---|");
  out.push(`| Profile | \`${technical.profile}\`${profile ? ` \u2013 ${profile.width} \xD7 ${profile.height}, ${profile.fps.replace(/\/1$/, "")} fps` : ""}; loudness from the brand pack (\`audio_master\`) |`);
  const d = technical.duration;
  out.push(`| Duration frame | ${formatSeconds(d.minSeconds)} \u2013 ${formatSeconds(d.maxSeconds)}${d.reference ? ` (reference ${formatSeconds(d.reference.minSeconds)} \u2013 ${formatSeconds(d.reference.maxSeconds)}: ${cell(d.reference.note)})` : ""} |`);
  const c = technical.captions;
  out.push(`| Captions | ${c.styles.length ? `${c.styles.map((s) => `\`${s}\``).join(" or ")}${c.required ? ", required" : ", optional"}; default ${c.default === "none" ? "none" : `\`${c.default}\``}` : "none"}${c.note ? ` \u2013 ${cell(c.note)}` : ""} |`);
  out.push(`| Music | ${technical.music.slot === "optional" ? "optional slot (audio track with role `music`, rights documented in sources.json)" : "no music"}${technical.music.note ? ` \u2013 ${cell(technical.music.note)}` : ""} |`);
  const deliverables = ["the video"];
  if (technical.deliverables.thumbnail)
    deliverables.push("the thumbnail");
  const ch = technical.deliverables.chapters;
  if (ch?.required)
    deliverables.push(`the YouTube chapter list (${ch.derive ? `derived from \`${ch.derive}\`` : "from chapters.json"})`);
  out.push(`| Deliverables | ${deliverables.join(", ")}${technical.deliverables.titleSuffix ? `; title ends with "${cell(technical.deliverables.titleSuffix)}"` : ""} |`);
  out.push("");
  if (ch?.note)
    out.push(`Chapters: ${ch.note}`, "");
  if (recipe.briefing.length) {
    out.push("## Brief \u2013 ask the editor", "");
    for (const q of recipe.briefing)
      out.push(`- ${q.required ? "**(required)** " : ""}${q.question}`);
    out.push("");
  }
  if (recipe.material.length) {
    out.push("## Material", "", "| Need | Kind | Level | Count | Description |", "|------|------|-------|-------|-------------|");
    for (const m of recipe.material)
      out.push(`| \`${m.id}\` ${cell(m.label)} | ${m.kind} | ${m.level} | ${range(m.min, m.max)} | ${cell([m.description, m.hints ? `Hints: ${m.hints}` : void 0].filter(Boolean).join(" "))} |`);
    out.push("");
  }
  out.push("## Structure", "");
  structure.sections.forEach((s, i) => {
    const sd = s.duration;
    const length2 = sd ? [sd.targetSeconds !== void 0 ? `~${formatSeconds(sd.targetSeconds)}` : null, sd.minSeconds !== void 0 || sd.maxSeconds !== void 0 ? range(sd.minSeconds, sd.maxSeconds) + " s" : null].filter(Boolean).join(", ") : "";
    out.push(`### ${i + 1}. ${s.title}${length2 ? ` (${length2})` : ""}`, "", s.purpose, "");
    if (s.blocks.length)
      out.push(`- Blocks: ${list(s.blocks)}`);
    if (s.material.length)
      out.push(`- Material: ${list(s.material)}`);
    for (const note of s.notes)
      out.push(`- ${note}`);
    if (s.blocks.length || s.material.length || s.notes.length)
      out.push("");
  });
  out.push("### Blocks", "", "| Block | Use | Count (whole video) | Required parameters | Role |", "|-------|-----|---------------------|---------------------|------|");
  for (const [name, spec] of Object.entries(structure.blocks)) {
    const n = spec.use === "required" ? range(spec.min ?? 1, spec.max) : range(void 0, spec.max);
    out.push(`| \`${name}\`${spec.still ? " (still image, never on a track)" : ""} | ${spec.use} | ${n} | ${spec.parameters?.required.length ? list(spec.parameters.required) : "\u2013"} | ${spec.role ? cell(spec.role) : ""} |`);
  }
  out.push("");
  const checks = [];
  if (structure.order.length)
    checks.push(`order of the first appearance: ${structure.order.map((b) => `\`${b}\``).join(" \u2192 ")}`);
  if (structure.endsWith)
    checks.push(`the video ends with \`${structure.endsWith}\``);
  if (structure.hook) {
    const until = structure.hook.untilBlock ? `until the first \`${structure.hook.untilBlock}\`` : `the first ${structure.hook.untilSeconds} s`;
    checks.push(`hook (${until}): no ${list(structure.hook.forbidden)}${structure.hook.note ? ` \u2013 ${structure.hook.note}` : ""}`);
  }
  for (const g of structure.groups)
    checks.push(`exactly one of ${list(g.oneOf)}${g.note ? ` (${g.note})` : ""}`);
  if (checks.length) {
    out.push("The recipe check reports deviations from:", "");
    for (const line of checks)
      out.push(`- ${line}`);
    out.push("");
  }
  if (recipe.rules.length) {
    out.push("## Rules", "");
    for (const level of ["hard", "recommended"]) {
      const rules = recipe.rules.filter((r) => r.level === level);
      if (!rules.length)
        continue;
      out.push(level === "hard" ? "**Part of the format** (a miss is a deviation \u2013 only when the editor asks for it, and reported):" : "**Recommended:**", "");
      for (const r of rules) {
        const how = r.check.kind === "machine" ? ` _(checked: \`${r.check.id}\`${Object.keys(r.check.params).length ? ` ${JSON.stringify(r.check.params)}` : ""})_` : "";
        out.push(`- \`${r.id}\` ${r.text}${how}`);
      }
      out.push("");
    }
  }
  out.push("## Reviews and done", "");
  out.push(`Done when the editor approved: ${list(recipe.review.done)} (outside the duration frame also \`duration-exception\`; \`captions-text\` counts as done without captions).`);
  if (recipe.review.report.length) {
    out.push("", "The review report names:", "");
    for (const item of recipe.review.report)
      out.push(`- ${item}`);
  }
  out.push("");
  if (recipe.capabilities.length) {
    out.push("## Capabilities of the brand pack", "");
    for (const name of recipe.capabilities) {
      const cap = catalog?.capabilities[name];
      out.push(`- \`${name}\`${cap ? ` \u2013 ${cap.description}${cap.guide ? ` Guide: \`brand/${cap.guide}\`.` : ""}${cap.tool ? ` Tool: \`brand/${cap.tool}\`.` : ""}` : ""}`);
    }
    out.push("");
  }
  out.push("Placing the blocks on the timeline (sting and logo end with video and audio clip, wipes instead of cuts, still images): `brand/README.md` of the brand pack.", "");
  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}
`;
}

// ../shared/dist/editing-pipeline/validate.js
var Issues = class {
  constructor() {
    this.list = [];
  }
  add(severity, code, file, path34, message, ref) {
    this.list.push({ severity, code, file, path: path34, message, ...ref ? { ref } : {} });
  }
  error(code, file, path34, message, ref) {
    this.add("error", code, file, path34, message, ref);
  }
  pending(code, file, path34, message, ref) {
    this.add("pending", code, file, path34, message, ref);
  }
  warning(code, file, path34, message, ref) {
    this.add("warning", code, file, path34, message, ref);
  }
};
function formatIssuePath(path34) {
  return path34.reduce((text3, part) => typeof part === "number" ? `${text3}[${part}]` : text3 ? `${text3}.${part}` : String(part), "");
}
function refAt(value2, path34) {
  let current = value2;
  let ref;
  for (const part of path34) {
    if (current === null || typeof current !== "object")
      break;
    current = current[part];
    if (current && typeof current === "object" && typeof current.id === "string")
      ref = current.id;
  }
  return ref;
}
function formatEditIssue(issue) {
  const where = [issue.file, issue.path].filter(Boolean).join(" ");
  return `${issue.severity} ${where}${issue.ref ? ` (${issue.ref})` : ""}: ${issue.message} [${issue.code}]`;
}
async function loadArtifact(reader, issues, kind, file) {
  const text3 = await reader.readText(file);
  if (text3 === null)
    return { status: "missing" };
  let raw;
  try {
    raw = JSON.parse(text3.charCodeAt(0) === 65279 ? text3.slice(1) : text3);
  } catch (error) {
    issues.error("invalid-json", file, "", `is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return { status: "invalid" };
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    issues.error("invalid-json", file, "", "must contain a JSON object");
    return { status: "invalid" };
  }
  const version = raw.schemaVersion;
  if (version === void 0) {
    issues.error("missing-schema-version", file, "schemaVersion", `is missing (this validator reads schemaVersion ${EDIT_SCHEMA_VERSION})`);
    return { status: "invalid" };
  }
  if (version !== EDIT_SCHEMA_VERSION) {
    issues.error("unsupported-schema-version", file, "schemaVersion", `schemaVersion ${JSON.stringify(version)} is not supported (this validator reads ${EDIT_SCHEMA_VERSION}); use the darkmind-agent version that wrote it or migrate the project, do not edit the number`);
    return { status: "invalid" };
  }
  const result = EDIT_ARTIFACT_SCHEMAS[kind].safeParse(raw);
  if (!result.success) {
    for (const issue of result.error.issues) {
      issues.error("schema", file, formatIssuePath(issue.path), issue.message, refAt(raw, issue.path));
    }
    return { status: "invalid" };
  }
  return { status: "ok", value: result.data, raw };
}
function topFolder(path34) {
  return path34.split("/")[0].toLowerCase();
}
function unsyncedFolderError(path34) {
  const top = topFolder(path34);
  if (top === EDIT_FOLDERS.renders || top === EDIT_FOLDERS.media || top === EDIT_FOLDERS.localState) {
    return `must not be in ${top}/ (not part of the project sync)`;
  }
  if (path34.toLowerCase() === "darkmind.json")
    return "darkmind.json is local sync state, not a pipeline artefact";
  return null;
}
function uncovered(intervals, total) {
  const sorted = intervals.filter((i) => i.end > i.start).sort((a, b) => a.start - b.start);
  const result = [];
  let cursor = 0;
  for (const interval of sorted) {
    if (interval.start > cursor)
      result.push({ start: cursor, end: Math.min(interval.start, total) });
    cursor = Math.max(cursor, interval.end);
    if (cursor >= total)
      break;
  }
  if (cursor < total)
    result.push({ start: cursor, end: total });
  return result.filter((i) => i.end > i.start);
}
function describeFrames(interval) {
  return interval.end - interval.start === 1 ? `frame ${interval.start}` : `frames ${interval.start}\u2013${interval.end - 1}`;
}
function rq(value2) {
  return parseRational(value2);
}
function sameRange(aIn, aOut, bIn, bOut) {
  return compareQ(rq(aIn), rq(bIn)) === 0 && compareQ(rq(aOut), rq(bOut)) === 0;
}
async function validateMaterial(reader, issues, sources, statements) {
  const file = EDIT_RECIPE_FILES.material;
  const text3 = await reader.readText(file);
  if (text3 === null)
    return;
  let raw;
  try {
    raw = JSON.parse(text3.charCodeAt(0) === 65279 ? text3.slice(1) : text3);
  } catch (error) {
    issues.error("invalid-json", file, "", `is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }
  const parsed = editMaterialSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues.slice(0, 20))
      issues.error("schema", file, formatIssuePath(issue.path), issue.message);
    return;
  }
  const seen = /* @__PURE__ */ new Set();
  parsed.data.needs.forEach((need, index) => {
    if (seen.has(need.needId))
      issues.error("duplicate-id", file, `needs[${index}].needId`, `need "${need.needId}" is listed twice`, need.needId);
    seen.add(need.needId);
    need.sources.forEach((id2, i) => {
      if (sources && !sources.has(id2))
        issues.error("unknown-source", file, `needs[${index}].sources[${i}]`, `source "${id2}" is not in sources.json`, need.needId);
    });
    need.statements.forEach((id2, i) => {
      if (statements && !statements.has(id2))
        issues.error("unknown-statement", file, `needs[${index}].statements[${i}]`, `statement "${id2}" is not in edit.json`, need.needId);
    });
    if (need.status === "covered" && !need.sources.length && !need.statements.length)
      issues.warning("material-unreferenced", file, `needs[${index}]`, "a covered need names no source or statement", need.needId);
  });
}
async function validateRecipeLock(reader, issues, projectFile, recipe) {
  const file = EDIT_RECIPE_FILES.lock;
  const text3 = await reader.readText(file);
  if (text3 === null) {
    issues.error("recipe-lock-missing", file, "", `does not exist, but ${projectFile} names recipe "${recipe.id}"; apply the recipe again with darkmind-agent recipe (never write the lock by hand)`);
    return;
  }
  let raw;
  try {
    raw = JSON.parse(text3.charCodeAt(0) === 65279 ? text3.slice(1) : text3);
  } catch (error) {
    issues.error("invalid-json", file, "", `is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }
  const parsed = editRecipeLockSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues.slice(0, 20))
      issues.error("schema", file, formatIssuePath(issue.path), issue.message);
    return;
  }
  const lock = parsed.data;
  const mismatch = [
    lock.slug !== recipe.id || lock.recipe.meta.id !== recipe.id ? `recipe "${lock.slug}"` : null,
    lock.version !== recipe.version ? `version ${lock.version ?? "draft"}` : null,
    lock.source !== recipe.source ? `source ${lock.source}` : null,
    lock.sha256 !== recipe.sha256 ? "another SHA-256" : null
  ].filter(Boolean);
  if (mismatch.length) {
    issues.error("recipe-lock-mismatch", file, "", `holds ${mismatch.join(", ")} than ${projectFile} recipe (${recipe.id} ${recipe.version ?? "draft"}); apply the recipe again with darkmind-agent recipe`);
  }
}
async function validateEditProject(reader, options = {}) {
  const issues = new Issues();
  const projectFile = options.projectPath ?? "project.json";
  const finish = (extra = {}) => {
    const counts = { error: 0, pending: 0, warning: 0 };
    for (const issue of issues.list)
      counts[issue.severity]++;
    return {
      valid: counts.error === 0,
      ready: counts.error === 0 && counts.pending === 0,
      issues: issues.list,
      counts,
      totalFrames: null,
      durationSeconds: null,
      fps: null,
      videoRefs: [],
      conform: [],
      documents: null,
      ...extra
    };
  };
  const projectLoaded = await loadArtifact(reader, issues, "project", projectFile);
  if (projectLoaded.status === "missing") {
    issues.error("missing-file", projectFile, "", 'does not exist; this folder is not an editing pipeline project (run "darkmind-agent import-cutlist" for an Explore import)');
  }
  if (projectLoaded.status !== "ok")
    return finish();
  const project = projectLoaded.value;
  const fps = rq(project.output.fps);
  let fpsValid = true;
  if (fps.d !== 1n || fps.n < 1n || fps.n > BigInt(EDIT_MAX_FPS)) {
    issues.error("unsupported-fps", projectFile, "output.fps", `must be a whole frame rate between 1 and ${EDIT_MAX_FPS} (v1 supports no NTSC or fractional rates)`);
    fpsValid = false;
  }
  if (project.duration && project.duration.minSeconds > project.duration.maxSeconds) {
    issues.error("duration-frame", projectFile, "duration", "minSeconds must not be greater than maxSeconds");
  }
  if (project.recipe)
    await validateRecipeLock(reader, issues, projectFile, project.recipe);
  const artifactEntries = Object.entries(project.artifacts);
  const seenArtifactPaths = /* @__PURE__ */ new Map();
  for (const [key, path34] of artifactEntries) {
    if (!path34)
      continue;
    const folderError = unsyncedFolderError(path34);
    if (folderError)
      issues.error("path-not-synced", projectFile, `artifacts.${key}`, `"${path34}" ${folderError}`);
    const lower = path34.toLowerCase();
    if (seenArtifactPaths.has(lower))
      issues.error("duplicate-path", projectFile, `artifacts.${key}`, `"${path34}" is also artifacts.${seenArtifactPaths.get(lower)}`);
    else
      seenArtifactPaths.set(lower, key);
  }
  const sourcesFile = project.artifacts.sources;
  const sourcesLoaded = await loadArtifact(reader, issues, "sources", sourcesFile);
  if (sourcesLoaded.status === "missing")
    issues.error("missing-file", sourcesFile, "", "does not exist (referenced by project.json artifacts.sources)");
  const sources = sourcesLoaded.status === "ok" ? sourcesLoaded.value : null;
  const sourceById = /* @__PURE__ */ new Map();
  if (sources) {
    for (const [index, source] of sources.sources.entries()) {
      const where = `sources[${index}]`;
      if (sourceById.has(source.id)) {
        issues.error("duplicate-id", sourcesFile, `${where}.id`, `duplicates sources[${sourceById.get(source.id).index}].id`, source.id);
        continue;
      }
      sourceById.set(source.id, { source, index });
      if (source.kind === "asset") {
        if (topFolder(source.path) !== EDIT_FOLDERS.assets) {
          issues.error("asset-path", sourcesFile, `${where}.path`, `"${source.path}" must be under ${EDIT_FOLDERS.assets}/ (synced with the project)`, source.id);
        } else if (!await reader.exists(source.path)) {
          issues.error("missing-file", sourcesFile, `${where}.path`, `"${source.path}" does not exist (assets are not regenerated automatically)`, source.id);
        }
      }
      const media = source.media;
      if (media) {
        if (compareQ(rq(media.durationSeconds), rational(0)) <= 0) {
          issues.error("media-facts", sourcesFile, `${where}.media.durationSeconds`, "must be greater than 0", source.id);
        }
        if (media.video && media.video.sampleAspectRatio !== "1:1") {
          issues.warning("non-square-pixels", sourcesFile, `${where}.media.video.sampleAspectRatio`, `pixel aspect ${media.video.sampleAspectRatio} is not verified (WP0 covered square pixels only); width/height must be the display size`, source.id);
        }
      }
    }
  }
  const sourceMedia = (sourceId) => sourceById.get(sourceId)?.source.media ?? null;
  const editFile = project.artifacts.edit;
  const editLoaded = await loadArtifact(reader, issues, "edit", editFile);
  if (editLoaded.status === "missing")
    issues.error("missing-file", editFile, "", "does not exist (referenced by project.json artifacts.edit)");
  const edit = editLoaded.status === "ok" ? editLoaded.value : null;
  const statementById = /* @__PURE__ */ new Map();
  const sceneById = /* @__PURE__ */ new Map();
  const brollIds = /* @__PURE__ */ new Set();
  const usedSourceIds2 = /* @__PURE__ */ new Set();
  const editIds = /* @__PURE__ */ new Map();
  const claimEditId = (itemId2, where) => {
    if (editIds.has(itemId2)) {
      issues.error("duplicate-id", editFile, `${where}.id`, `duplicates ${editIds.get(itemId2)}.id`, itemId2);
      return false;
    }
    editIds.set(itemId2, where);
    return true;
  };
  const checkSourceRange = (file, where, ref, sourceId, range2) => {
    if (sourceId !== null) {
      if (!sourceById.has(sourceId)) {
        if (sources)
          issues.error("unknown-source", file, `${where}.sourceId`, `source "${sourceId}" is not in ${sourcesFile}`, ref);
      } else
        usedSourceIds2.add(sourceId);
    }
    if (range2) {
      const rIn = rq(range2.in);
      const rOut = rq(range2.out);
      if (compareQ(rOut, rIn) <= 0)
        issues.error("range-invalid", file, `${where}.range.out`, "must be after range.in", ref);
      const media = sourceId ? sourceMedia(sourceId) : null;
      if (media && compareQ(rOut, rq(media.durationSeconds)) > 0) {
        issues.error("range-beyond-source", file, `${where}.range.out`, `is after the end of source "${sourceId}" (${formatRationalReadable(rq(media.durationSeconds))} s)`, ref);
      }
    }
  };
  if (edit) {
    for (const [index, item] of edit.sequence.entries()) {
      const where = `sequence[${index}]`;
      if (!claimEditId(item.id, where))
        continue;
      for (const code of item.unresolved) {
        issues.pending(`unresolved-${code}`, editFile, `${where}.unresolved`, `open point "${code}" must be resolved before the editorial review (remove it only after checking at the material)`, item.id);
      }
      if (item.kind === "statement") {
        statementById.set(item.id, { item, index });
        if (item.sourceId === null)
          issues.pending("source-missing", editFile, `${where}.sourceId`, "statement has no source yet; find it at the material (never guess video IDs from file names)", item.id);
        if (item.range === null)
          issues.pending("range-unresolved", editFile, `${where}.range`, "statement has no resolved source range yet; set in/out at the material (research timecodes are approximate)", item.id);
        if (!item.quote || !item.quote.trim())
          issues.pending("quote-missing", editFile, `${where}.quote`, "statement has no verified quote yet", item.id);
        if (!item.context.trim())
          issues.pending("context-missing", editFile, `${where}.context`, "statement needs context for the editorial review", item.id);
        checkSourceRange(editFile, where, item.id, item.sourceId, item.range);
      } else {
        sceneById.set(item.id, { item, index });
        if (item.extensionId === null)
          issues.pending("scene-without-extension", editFile, `${where}.extensionId`, "scene has no extension that renders it yet", item.id);
      }
    }
    for (const [index, item] of edit.broll.entries()) {
      const where = `broll[${index}]`;
      if (!claimEditId(item.id, where))
        continue;
      brollIds.add(item.id);
      for (const code of item.unresolved) {
        issues.pending(`unresolved-${code}`, editFile, `${where}.unresolved`, `open point "${code}" must be resolved at the material`, item.id);
      }
      if (item.sourceId === null)
        issues.pending("source-missing", editFile, `${where}.sourceId`, "B-roll has no source yet", item.id);
      if (item.range === null)
        issues.pending("range-unresolved", editFile, `${where}.range`, "B-roll has no resolved source range yet", item.id);
      checkSourceRange(editFile, where, item.id, item.sourceId, item.range);
      if (item.afterId && !statementById.has(item.afterId) && !sceneById.has(item.afterId)) {
        issues.error("unknown-item", editFile, `${where}.afterId`, `"${item.afterId}" is not a sequence item`, item.id);
      }
    }
  }
  const extensionById = /* @__PURE__ */ new Map();
  const extensionPaths = /* @__PURE__ */ new Set();
  const outputPaths = /* @__PURE__ */ new Map();
  for (const [index, path34] of project.extensions.entries()) {
    const where = `extensions[${index}]`;
    if (topFolder(path34) !== EDIT_FOLDERS.extensions || !path34.toLowerCase().endsWith(".json")) {
      issues.error("extension-path", projectFile, where, `"${path34}" must be a .json file under ${EDIT_FOLDERS.extensions}/`);
      continue;
    }
    if (extensionPaths.has(path34.toLowerCase())) {
      issues.error("duplicate-path", projectFile, where, `"${path34}" is listed twice`);
      continue;
    }
    extensionPaths.add(path34.toLowerCase());
    const loaded = await loadArtifact(reader, issues, "extension", path34);
    if (loaded.status === "missing")
      issues.error("missing-file", projectFile, where, `"${path34}" does not exist`);
    if (loaded.status !== "ok")
      continue;
    const extension = loaded.value;
    if (extensionById.has(extension.id)) {
      issues.error("duplicate-id", path34, "id", `extension "${extension.id}" is also defined in ${extensionById.get(extension.id).file}`, extension.id);
      continue;
    }
    extensionById.set(extension.id, { extension, file: path34 });
    const out = extension.output;
    if (!out.path.toLowerCase().startsWith(`${EDIT_EXTENSION_OUTPUT_FOLDER}/`)) {
      issues.error("extension-output-path", path34, "output.path", `"${out.path}" must be under ${EDIT_EXTENSION_OUTPUT_FOLDER}/ (reproducible, not synced, separate from the render outputs)`, extension.id);
    } else if (outputPaths.has(out.path.toLowerCase())) {
      issues.error("duplicate-path", path34, "output.path", `"${out.path}" is also the output of extension "${outputPaths.get(out.path.toLowerCase())}"`, extension.id);
    } else
      outputPaths.set(out.path.toLowerCase(), extension.id);
    const extFps = rq(out.fps);
    if (extFps.d !== 1n || extFps.n < 1n || extFps.n > BigInt(EDIT_MAX_FPS)) {
      issues.error("unsupported-fps", path34, "output.fps", `must be a whole frame rate between 1 and ${EDIT_MAX_FPS}`, extension.id);
    }
    for (const [inputIndex, input] of extension.inputs.entries()) {
      const inputWhere = `inputs[${inputIndex}]`;
      if (input.kind === "file") {
        const folderError = unsyncedFolderError(input.path);
        if (folderError)
          issues.error("undeclared-input-path", path34, `${inputWhere}.path`, `"${input.path}" ${folderError}; declare rendered inputs as kind "extension"`, extension.id);
        else if (!await reader.exists(input.path)) {
          issues.error("missing-file", path34, `${inputWhere}.path`, `"${input.path}" does not exist (restore it from the project archive; saved inputs such as AI media are never regenerated automatically)`, extension.id);
        }
      } else if (input.kind === "source") {
        if (!sourceById.has(input.sourceId) && sources)
          issues.error("unknown-source", path34, `${inputWhere}.sourceId`, `source "${input.sourceId}" is not in ${sourcesFile}`, extension.id);
      }
    }
    if (extension.sceneId && !sceneById.has(extension.sceneId) && edit) {
      issues.error("unknown-item", path34, "sceneId", `"${extension.sceneId}" is not a scene in ${editFile}`, extension.id);
    }
  }
  for (const { extension, file } of extensionById.values()) {
    for (const [inputIndex, input] of extension.inputs.entries()) {
      if (input.kind === "extension" && !extensionById.has(input.extensionId)) {
        issues.error("unknown-extension", file, `inputs[${inputIndex}].extensionId`, `extension "${input.extensionId}" is not listed in project.json extensions`, extension.id);
      }
    }
  }
  await checkUndeclaredExtensionInputs(reader, issues, extensionById, outputPaths, sourceById);
  for (const cycle of findExtensionCycles([...extensionById.values()].map((entry) => entry.extension))) {
    const first = extensionById.get(cycle[0]);
    issues.error("extension-cycle", first.file, "inputs", `extension inputs form a cycle: ${[...cycle, cycle[0]].join(" \u2192 ")}`, cycle[0]);
  }
  for (const [sceneId, { item, index }] of sceneById) {
    if (item.extensionId !== null && !extensionById.has(item.extensionId)) {
      issues.error("unknown-extension", editFile, `sequence[${index}].extensionId`, `extension "${item.extensionId}" is not listed in project.json extensions`, sceneId);
    }
  }
  await validateMaterial(reader, issues, sources ? sourceById : null, edit ? statementById : null);
  const timelineFile = project.artifacts.timeline;
  const timelineLoaded = await loadArtifact(reader, issues, "timeline", timelineFile);
  if (timelineLoaded.status === "missing")
    issues.pending("timeline-missing", timelineFile, "", "does not exist yet; build it after the draft is resolved");
  const timeline = timelineLoaded.status === "ok" ? timelineLoaded.value : null;
  let totalFrames = null;
  const usedExtensionIds = /* @__PURE__ */ new Set();
  const statementSpans = /* @__PURE__ */ new Map();
  if (timeline && fpsValid) {
    totalFrames = validateTimeline({
      timeline,
      file: timelineFile,
      fps,
      project,
      issues,
      sourceById,
      sourcesLoaded: Boolean(sources),
      statementById,
      sceneById,
      brollIds,
      editLoaded: Boolean(edit),
      editFile,
      extensionById,
      usedSourceIds: usedSourceIds2,
      usedExtensionIds,
      statementSpans
    });
  }
  const captionsFile = project.artifacts.captions;
  const captionsLoaded = await loadArtifact(reader, issues, "captions", captionsFile);
  if (captionsLoaded.status === "missing")
    issues.pending("captions-missing", captionsFile, "", "does not exist yet");
  const captions = captionsLoaded.status === "ok" ? captionsLoaded.value : null;
  if (captions) {
    validateCaptions({ captions, file: captionsFile, issues, totalFrames, statementById, sceneById, editLoaded: Boolean(edit), statementSpans });
    if (captions.captions.length === 0 && statementById.size > 0)
      issues.warning("no-captions", captionsFile, "captions", "the project has statements but no captions");
    if (isBrandCaptionStyle(captions.style) && captions.captions.length > 0) {
      const block2 = EDIT_BRAND_CAPTION_BLOCKS[captions.style];
      const readers = [...extensionInputClosure([...usedExtensionIds], extensionById).extensions].filter((id2) => extensionById.get(id2)?.extension.inputs.some((input) => input.kind === "file" && input.path.toLowerCase() === captionsFile.toLowerCase()));
      if (timeline && readers.length === 0) {
        issues.warning("brand-captions-unrendered", captionsFile, "style", `style "${captions.style}" is rendered only by the brand block ${block2} (an extension that declares ${captionsFile} as input, placed on an overlay track); no extension on the timeline reads the captions, so they would not appear`);
      }
      if (captions.style === "brand-word") {
        captions.captions.forEach((caption, index) => {
          if (caption.statementId !== void 0 && !caption.words?.length) {
            issues.warning("caption-words-missing", captionsFile, `captions[${index}].words`, "brand-word captions appear word by word and need word timings (MCP get_word_timings \u2192 darkmind-agent captions-words); the block refuses statement captions without words", caption.id);
          }
        });
      }
    }
  }
  let toolchain = null;
  if (project.artifacts.toolchain) {
    const loaded = await loadArtifact(reader, issues, "toolchain", project.artifacts.toolchain);
    if (loaded.status === "missing")
      issues.pending("toolchain-missing", project.artifacts.toolchain, "", "does not exist yet (recorded by the renderer)");
    if (loaded.status === "ok")
      toolchain = loaded.value;
  }
  if (project.artifacts.brief && !await reader.exists(project.artifacts.brief)) {
    issues.warning("missing-file", projectFile, "artifacts.brief", `"${project.artifacts.brief}" does not exist`);
  }
  const extensionClosure = extensionInputClosure([
    ...usedExtensionIds,
    ...[...sceneById.values()].map((s) => s.item.extensionId).filter((v) => !!v),
    ...[...extensionById.values()].filter((e) => e.extension.output.image).map((e) => e.extension.id)
  ], extensionById);
  for (const sourceId of extensionClosure.sources)
    if (sourceById.has(sourceId))
      usedSourceIds2.add(sourceId);
  const conform = [];
  for (const sourceId of [...usedSourceIds2].sort()) {
    const entry = sourceById.get(sourceId);
    if (!entry)
      continue;
    const rights = entry.source.rights;
    const needsRights = entry.source.kind === "asset" && EDIT_RIGHTS_REQUIRED_ORIGINS.includes(entry.source.origin);
    if (needsRights && !rights) {
      issues.warning("rights-missing", sourcesFile, `sources[${entry.index}].rights`, `third-party material (origin "${entry.source.kind === "asset" ? entry.source.origin : ""}") without a rights entry (holder, licence, status, scope \u2013 T14); the final render and the export are blocked until the rights are cleared`, sourceId);
    } else if (rights && rights.status !== "cleared") {
      issues.warning("rights-unclear", sourcesFile, `sources[${entry.index}].rights.status`, `rights are "${rights.status}" (holder ${rights.holder}, ${rights.license}); the final render and the export are blocked until they are "cleared" (T14)`, sourceId);
    }
    const where = `sources[${entry.index}].media`;
    const media = entry.source.media;
    if (!media) {
      if (timeline)
        issues.pending("media-facts-missing", sourcesFile, where, "ffprobe facts of the original are not recorded; frame mapping, crop, conform (C1) and colour (C2) cannot be checked", sourceId);
      continue;
    }
    const color = assessColor(media);
    if (color.status === "unsupported")
      issues.error("color-unsupported", sourcesFile, `${where}.video.colorTransfer`, color.message, sourceId);
    if (color.status === "assumed-bt709")
      issues.warning("color-unsignalled", sourcesFile, `${where}.video.colorTransfer`, color.message, sourceId);
    const assessment = assessConform(media);
    if (assessment.needed)
      conform.push({ sourceId, reasons: assessment.reasons });
  }
  if (sources) {
    for (const [sourceId, { index }] of sourceById) {
      if (!usedSourceIds2.has(sourceId))
        issues.warning("unused-source", sourcesFile, `sources[${index}]`, "is not used by edit.json, timeline.json or an extension (research sources create no project references)", sourceId);
    }
  }
  const documents = { project, sources, edit, timeline, captions, toolchain, extensions: [...extensionById.values()].map((e) => e.extension) };
  return finish({
    totalFrames,
    durationSeconds: totalFrames === null ? null : formatRationalReadable(framesToSeconds(totalFrames, fps)),
    fps: formatRationalReadable(fps),
    videoRefs: deriveEditVideoRefs(documents),
    conform,
    documents
  });
}
function validateTimeline(ctx) {
  const { timeline, file, fps, project, issues } = ctx;
  const trackIds = /* @__PURE__ */ new Map();
  const clipIds = /* @__PURE__ */ new Map();
  const placedVideo = /* @__PURE__ */ new Map();
  const allClips = [];
  const dialogClips = [];
  const output = project.output;
  const checkClip = (kind, track, trackIndex, clip, clipIndex) => {
    const where = `${kind}[${trackIndex}].clips[${clipIndex}]`;
    const ref = clip.id;
    if (clipIds.has(clip.id))
      issues.error("duplicate-id", file, `${where}.id`, `duplicates ${clipIds.get(clip.id)}.id (clip IDs are unique across all tracks)`, ref);
    else
      clipIds.set(clip.id, where);
    const hasSource = clip.sourceId !== void 0;
    const hasExtension = clip.extensionId !== void 0;
    if (hasSource === hasExtension) {
      issues.error("clip-source", file, where, "needs exactly one of sourceId or extensionId", ref);
      return null;
    }
    const clipIn = rq(clip.in);
    const clipOut = rq(clip.out);
    if (compareQ(clipOut, clipIn) <= 0) {
      issues.error("range-invalid", file, `${where}.out`, "must be after in", ref);
      return null;
    }
    const frames = Number(rangeFrames(clipIn, clipOut, fps));
    if (frames < 1) {
      issues.error("empty-clip", file, `${where}.out`, `range ${clip.in}\u2013${clip.out} s is shorter than half a frame at ${formatRationalReadable(fps)} fps`, ref);
      return null;
    }
    let fills = kind === "video" && (track.role === "main" || track.role === "b-roll");
    if (hasSource) {
      const entry = ctx.sourceById.get(clip.sourceId);
      if (!entry) {
        if (ctx.sourcesLoaded)
          issues.error("unknown-source", file, `${where}.sourceId`, `source "${clip.sourceId}" is not in the sources file`, ref);
      } else {
        ctx.usedSourceIds.add(clip.sourceId);
        const media = entry.source.media;
        if (media) {
          if (compareQ(clipOut, rq(media.durationSeconds)) > 0) {
            issues.error("range-beyond-source", file, `${where}.out`, `is after the end of source "${clip.sourceId}" (${formatRationalReadable(rq(media.durationSeconds))} s)`, ref);
          }
          if (kind === "video" && !media.video)
            issues.error("no-video-stream", file, `${where}.sourceId`, `source "${clip.sourceId}" has no video stream`, ref);
          if (kind === "audio" && !media.audio)
            issues.error("no-audio-stream", file, `${where}.sourceId`, `source "${clip.sourceId}" has no audio stream`, ref);
        }
        if (kind === "video") {
          const crop = clip.crop;
          if (!crop) {
            issues.error("crop-missing", file, `${where}.crop`, 'source clips need an explicit crop rectangle (no silent centre crop); use {"x":"0","y":"0","w":"1","h":"1"} for a source with the output aspect ratio', ref);
          } else {
            const rect = parseCrop(crop);
            const bounds = getCropBoundsError(rect);
            if (bounds)
              issues.error("crop-bounds", file, `${where}.crop${bounds.field ? `.${bounds.field}` : ""}`, bounds.message, ref);
            else if (media?.video) {
              const aspect = getCropAspectError(rect, media.video.width, media.video.height, output.width, output.height);
              if (aspect)
                issues.error("crop-aspect", file, `${where}.crop`, aspect, ref);
              else {
                const geometry = cropGeometry(rect, media.video.width, media.video.height, output.width, output.height);
                if (geometry.offsetX + output.width > geometry.scaledWidth + 0.5 || geometry.offsetY + output.height > geometry.scaledHeight + 0.5) {
                  issues.error("crop-bounds", file, `${where}.crop`, "rectangle leaves the source image after quantisation to output pixels", ref);
                }
              }
            }
          }
        }
      }
    } else {
      const entry = ctx.extensionById.get(clip.extensionId);
      if (!entry) {
        issues.error("unknown-extension", file, `${where}.extensionId`, `extension "${clip.extensionId}" is not listed in project.json extensions`, ref);
      } else {
        ctx.usedExtensionIds.add(clip.extensionId);
        const out = entry.extension.output;
        const extFps = rq(out.fps);
        if (out.image) {
          issues.error("extension-still-image", file, `${where}.extensionId`, `extension "${clip.extensionId}" renders a still image (output.image, e.g. the thumbnail): a deliverable next to the video, not a clip; remove it from the timeline`, ref);
        } else if (kind === "video") {
          if (clip.crop !== void 0)
            issues.error("extension-crop", file, `${where}.crop`, "extension clips are rendered at the output size and take no crop", ref);
          if (out.video === false)
            issues.error("no-video-stream", file, `${where}.extensionId`, `extension "${clip.extensionId}" renders audio only (output.video false); place it on an audio track`, ref);
          else if (out.width !== output.width || out.height !== output.height || compareQ(extFps, fps) !== 0) {
            issues.error("extension-format", file, `${where}.extensionId`, `extension "${clip.extensionId}" renders ${out.width}x${out.height} at ${out.fps} fps, the project needs ${output.width}x${output.height} at ${output.fps}`, ref);
          }
          if (out.alpha)
            fills = false;
        }
        if (!out.image && kind === "audio" && !out.audio)
          issues.error("no-audio-stream", file, `${where}.extensionId`, `extension "${clip.extensionId}" renders no audio`, ref);
        if (!out.image && extFps.n > 0n && compareQ(clipOut, divQ(rational(out.durationFrames), extFps)) > 0) {
          issues.error("range-beyond-source", file, `${where}.out`, `is after the end of the rendered extension (${out.durationFrames} frames)`, ref);
        }
      }
    }
    if (clip.statementId !== void 0) {
      const statement = ctx.statementById.get(clip.statementId);
      if (!statement) {
        if (ctx.editLoaded) {
          const isScene = ctx.sceneById.has(clip.statementId);
          issues.error("unknown-item", file, `${where}.statementId`, `"${clip.statementId}" is not a statement in edit.json${isScene ? " (it is a scene: use sceneId)" : ""}`, ref);
        }
      } else if (!hasSource) {
        issues.error("statement-binding", file, `${where}.statementId`, "statements are bound to source clips, not extension clips", ref);
      } else {
        const item = statement.item;
        if (item.sourceId !== null && item.sourceId !== clip.sourceId) {
          issues.error("statement-binding", file, `${where}.sourceId`, `statement "${item.id}" uses source "${item.sourceId}", the clip "${clip.sourceId}"`, ref);
        }
        if (item.range) {
          if (kind === "audio") {
            if (!sameRange(clip.in, clip.out, item.range.in, item.range.out)) {
              issues.error("statement-binding", file, `${where}.in`, `dialog audio must use the approved range of statement "${item.id}" (${item.range.in}\u2013${item.range.out} s), not ${clip.in}\u2013${clip.out} s; change edit.json instead (needs a new editorial review)`, ref);
            }
          } else if (compareQ(clipIn, rq(item.range.in)) < 0 || compareQ(clipOut, rq(item.range.out)) > 0) {
            issues.error("statement-binding", file, `${where}.in`, `video of statement "${item.id}" must lie within its range ${item.range.in}\u2013${item.range.out} s`, ref);
          }
        }
      }
    }
    if (clip.sceneId !== void 0) {
      const scene = ctx.sceneById.get(clip.sceneId);
      if (!scene) {
        if (ctx.editLoaded)
          issues.error("unknown-item", file, `${where}.sceneId`, `"${clip.sceneId}" is not a scene in edit.json`, ref);
      } else if (hasExtension && scene.item.extensionId !== null && scene.item.extensionId !== clip.extensionId) {
        issues.error("scene-binding", file, `${where}.extensionId`, `scene "${clip.sceneId}" is rendered by extension "${scene.item.extensionId}", not "${clip.extensionId}"`, ref);
      }
    }
    if (clip.brollId !== void 0 && !ctx.brollIds.has(clip.brollId) && ctx.editLoaded) {
      issues.error("unknown-item", file, `${where}.brollId`, `"${clip.brollId}" is not a B-roll item in edit.json`, ref);
    }
    const placed = {
      id: clip.id,
      where,
      track: { id: track.id, role: track.role, kind },
      ...hasSource ? { sourceId: clip.sourceId } : { extensionId: clip.extensionId },
      ...clip.sceneId !== void 0 ? { sceneId: clip.sceneId } : {},
      in: clip.in,
      out: clip.out,
      start: clip.start,
      end: clip.start + frames,
      fills
    };
    if (kind === "audio") {
      if (track.role === "dialog") {
        if (clip.statementId === void 0)
          issues.error("dialog-without-statement", file, `${where}.statementId`, "clips on dialog tracks must reference their statement in edit.json", ref);
        else if (ctx.statementById.has(clip.statementId))
          dialogClips.push({ clip: placed, statementId: clip.statementId });
      }
    }
    return placed;
  };
  const tracks = [
    ...timeline.video.map((track, index) => ({ kind: "video", track, index })),
    ...timeline.audio.map((track, index) => ({ kind: "audio", track, index }))
  ];
  for (const { kind, track, index } of tracks) {
    const trackWhere = `${kind}[${index}]`;
    if (trackIds.has(track.id))
      issues.error("duplicate-id", file, `${trackWhere}.id`, `duplicates ${trackIds.get(track.id)}.id`, track.id);
    else
      trackIds.set(track.id, trackWhere);
    const placed = [];
    track.clips.forEach((clip, clipIndex) => {
      const result = checkClip(kind, track, index, clip, clipIndex);
      if (result)
        placed.push(result);
    });
    const sorted = [...placed].sort((a, b) => a.start - b.start);
    let furthest = null;
    for (const current of sorted) {
      if (furthest && current.start < furthest.end) {
        issues.error("clip-overlap", file, `${current.where}.start`, `overlaps clip "${furthest.id}" on track ${track.id} (ends at frame ${furthest.end})`, current.id);
      }
      if (!furthest || current.end > furthest.end)
        furthest = current;
    }
    for (const clip of placed) {
      allClips.push(clip);
      if (kind === "video")
        placedVideo.set(clip.id, clip);
    }
  }
  timeline.audio.forEach((track, trackIndex) => {
    track.clips.forEach((clip, clipIndex) => {
      if (clip.linkedTo === void 0)
        return;
      const where = `audio[${trackIndex}].clips[${clipIndex}].linkedTo`;
      const video = placedVideo.get(clip.linkedTo);
      if (!video) {
        issues.error("unknown-clip", file, where, `"${clip.linkedTo}" is not a video clip`, clip.id);
        return;
      }
      const sameSource2 = (video.sourceId ?? video.extensionId) === (clip.sourceId ?? clip.extensionId);
      if (!sameSource2 || video.start !== clip.start || !sameRange(video.in, video.out, clip.in, clip.out)) {
        issues.error("link-mismatch", file, where, `linked clips need the same source, in/out and start as video clip "${video.id}"`, clip.id);
      }
    });
  });
  let total = 0;
  for (const clip of allClips)
    total = Math.max(total, clip.end);
  timeline.gaps.forEach((gap, index) => {
    if (gap.end <= gap.start)
      issues.error("gap-invalid", file, `gaps[${index}].end`, "must be after start");
    else
      total = Math.max(total, gap.end);
  });
  if (allClips.length === 0) {
    issues.pending("timeline-empty", file, "", "has no clips yet");
    return total;
  }
  const blackGaps = timeline.gaps.filter((g) => g.fill !== "silence").map((g) => ({ start: g.start, end: g.end }));
  const silentGaps = timeline.gaps.filter((g) => g.fill !== "black").map((g) => ({ start: g.start, end: g.end }));
  for (const hole of uncovered([...allClips.filter((c) => c.track.kind === "video" && c.fills), ...blackGaps], total)) {
    issues.error("video-gap", file, "video", `${describeFrames(hole)} show no picture on a main/B-roll track; add a clip or an explicit gap with fill "black"`);
  }
  for (const hole of uncovered([...allClips.filter((c) => c.track.kind === "audio"), ...silentGaps], total)) {
    issues.error("audio-gap", file, "audio", `${describeFrames(hole)} have no audio; add a clip or an explicit gap with fill "silence"`);
  }
  const seen = /* @__PURE__ */ new Map();
  for (const { clip, statementId } of [...dialogClips].sort((a, b) => a.clip.start - b.clip.start)) {
    if (seen.has(statementId)) {
      issues.error("statement-reused", file, `${clip.where}.statementId`, `statement "${statementId}" is already used by "${seen.get(statementId).id}"; add a separate statement to edit.json for a repetition`, clip.id);
      continue;
    }
    seen.set(statementId, clip);
    ctx.statementSpans.set(statementId, { start: clip.start, end: clip.end });
  }
  const scenesPlaced = /* @__PURE__ */ new Map();
  const scenesOnMain = /* @__PURE__ */ new Map();
  for (const clip of [...allClips].sort((a, b) => a.start - b.start)) {
    if (!clip.sceneId || !ctx.sceneById.has(clip.sceneId))
      continue;
    if (!scenesPlaced.has(clip.sceneId))
      scenesPlaced.set(clip.sceneId, clip);
    if (clip.track.role === "main" && !scenesOnMain.has(clip.sceneId))
      scenesOnMain.set(clip.sceneId, clip);
  }
  const placements = [
    ...[...seen].map(([itemId2, clip]) => ({ itemId: itemId2, clip, index: ctx.statementById.get(itemId2).index })),
    ...[...scenesOnMain].map(([itemId2, clip]) => ({ itemId: itemId2, clip, index: ctx.sceneById.get(itemId2).index }))
  ].sort((a, b) => a.clip.start - b.clip.start || a.index - b.index);
  let last = null;
  for (const placement of placements) {
    if (last && placement.index < last.index) {
      issues.error("sequence-order", file, `${placement.clip.where}.start`, `"${placement.itemId}" comes after "${last.itemId}" in the timeline but before it in edit.json; reorder edit.json (needs a new editorial review) or the timeline`, placement.clip.id);
    }
    if (!last || placement.index > last.index)
      last = placement;
  }
  for (const [statementId, { index }] of ctx.statementById) {
    if (!seen.has(statementId))
      issues.pending("statement-not-in-timeline", ctx.editFile, `sequence[${index}]`, "statement is not used by any dialog clip of the timeline yet", statementId);
  }
  for (const [sceneId, { index }] of ctx.sceneById) {
    if (!scenesPlaced.has(sceneId))
      issues.pending("scene-not-in-timeline", ctx.editFile, `sequence[${index}]`, "scene is not used by any timeline clip (sceneId) yet", sceneId);
  }
  const duration = project.duration;
  if (duration) {
    const seconds2 = toNumberQ(framesToSeconds(total, fps));
    if (seconds2 < duration.minSeconds || seconds2 > duration.maxSeconds) {
      issues.warning("duration-out-of-range", file, "", `timeline is ${formatRationalReadable(framesToSeconds(total, fps), 3)} s (${total} frames), outside the frame ${duration.minSeconds}\u2013${duration.maxSeconds} s; needs an explicit exception by the editor (no automatic truncation)`);
    }
  }
  return total;
}
function validateCaptions(ctx) {
  const { captions, file, issues } = ctx;
  const ids = /* @__PURE__ */ new Map();
  const valid = [];
  captions.captions.forEach((caption, index) => {
    const where = `captions[${index}]`;
    const ref = caption.id;
    if (ids.has(caption.id))
      issues.error("duplicate-id", file, `${where}.id`, `duplicates captions[${ids.get(caption.id)}].id`, ref);
    else
      ids.set(caption.id, index);
    let ok = true;
    if (caption.end <= caption.start) {
      issues.error("caption-time", file, `${where}.end`, "must be after start (whole timeline frames)", ref);
      ok = false;
    }
    if (ctx.totalFrames !== null && caption.end > ctx.totalFrames) {
      issues.error("caption-after-end", file, `${where}.end`, `is after the end of the timeline (frame ${ctx.totalFrames})`, ref);
    }
    const refs = (caption.statementId !== void 0 ? 1 : 0) + (caption.sceneId !== void 0 ? 1 : 0);
    if (refs !== 1)
      issues.error("caption-reference", file, where, "needs exactly one of statementId or sceneId (captions refer to the reviewed statement or scene)", ref);
    if (caption.statementId !== void 0 && ctx.editLoaded && !ctx.statementById.has(caption.statementId)) {
      issues.error("unknown-item", file, `${where}.statementId`, `"${caption.statementId}" is not a statement in edit.json`, ref);
    }
    if (caption.sceneId !== void 0 && ctx.editLoaded && !ctx.sceneById.has(caption.sceneId)) {
      issues.error("unknown-item", file, `${where}.sceneId`, `"${caption.sceneId}" is not a scene in edit.json`, ref);
    }
    if (!caption.text.trim())
      issues.error("caption-text", file, `${where}.text`, "must not be blank", ref);
    if (/\r?\n\s*\r?\n/.test(caption.text))
      issues.error("caption-text", file, `${where}.text`, "must not contain empty lines (they end an SRT entry)", ref);
    if (caption.text.includes("-->"))
      issues.error("caption-text", file, `${where}.text`, 'must not contain "-->" (SRT timing syntax)', ref);
    if (caption.words) {
      let cursor = caption.start;
      let textPos = 0;
      caption.words.forEach((word, wordIndex) => {
        const wordWhere = `${where}.words[${wordIndex}]`;
        if (word.end <= word.start)
          issues.error("caption-words", file, `${wordWhere}.end`, "must be after start", ref);
        if (word.start < cursor || word.end > caption.end)
          issues.error("caption-words", file, `${wordWhere}.start`, "word timings must be ordered, without overlap and inside the caption", ref);
        cursor = Math.max(cursor, word.end);
        const found = caption.text.indexOf(word.text, textPos);
        if (found < 0)
          issues.error("caption-words", file, `${wordWhere}.text`, `"${word.text}" does not appear in the caption text (in order)`, ref);
        else
          textPos = found + word.text.length;
      });
    }
    if (caption.statementId !== void 0) {
      const span = ctx.statementSpans.get(caption.statementId);
      if (span && (caption.end <= span.start || caption.start >= span.end)) {
        issues.warning("caption-outside-statement", file, where, `is not shown while statement "${caption.statementId}" is heard (frames ${span.start}\u2013${span.end - 1})`, ref);
      }
    }
    if (ok)
      valid.push({ start: caption.start, end: caption.end, id: caption.id, index });
  });
  const sorted = valid.sort((a, b) => a.start - b.start);
  let furthest = null;
  for (const current of sorted) {
    if (furthest && current.start < furthest.end) {
      issues.error("caption-overlap", file, `captions[${current.index}].start`, `overlaps caption "${furthest.id}" (ends at frame ${furthest.end}); a caption track has no overlaps`, current.id);
    }
    if (!furthest || current.end > furthest.end)
      furthest = current;
  }
}
function findExtensionCycles(extensions) {
  const byId = new Map(extensions.map((e) => [e.id, e]));
  const state = /* @__PURE__ */ new Map();
  const cycles = [];
  const stack = [];
  const visit = (extensionId) => {
    state.set(extensionId, "visiting");
    stack.push(extensionId);
    for (const input of byId.get(extensionId)?.inputs ?? []) {
      if (input.kind !== "extension" || !byId.has(input.extensionId))
        continue;
      const next = state.get(input.extensionId);
      if (next === "visiting")
        cycles.push(stack.slice(stack.indexOf(input.extensionId)));
      else if (next === void 0)
        visit(input.extensionId);
    }
    stack.pop();
    state.set(extensionId, "done");
  };
  for (const extension of [...extensions].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)) {
    if (!state.has(extension.id))
      visit(extension.id);
  }
  return cycles;
}
function extensionExecutionOrder(extensions, only) {
  const byId = new Map(extensions.map((e) => [e.id, e]));
  const order = [];
  const seen = /* @__PURE__ */ new Set();
  const visit = (extensionId) => {
    if (seen.has(extensionId) || !byId.has(extensionId))
      return;
    seen.add(extensionId);
    const inputs = byId.get(extensionId).inputs.filter((input) => input.kind === "extension").map((input) => input.extensionId);
    for (const next of [...inputs].sort())
      visit(next);
    order.push(extensionId);
  };
  const roots = only ? [...new Set(only)] : [...byId.keys()];
  for (const id2 of roots.sort())
    visit(id2);
  return order;
}
function argumentPaths(arg) {
  const values = arg.startsWith("-") ? arg.includes("=") ? [arg.slice(arg.indexOf("=") + 1)] : [] : arg.includes("=") ? [arg, arg.slice(arg.indexOf("=") + 1)] : [arg];
  const result = [];
  for (const raw of values) {
    const value2 = raw.replace(/\\/g, "/");
    if (!value2.trim() || /[\r\n]/.test(value2))
      continue;
    if (value2.startsWith("/") || /^[A-Za-z]:\//.test(value2)) {
      result.push("outside");
      continue;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(value2))
      continue;
    const normalised = value2.replace(/^(\.\/)+/, "");
    result.push(normalised.split("/").includes("..") ? "outside" : normalised);
  }
  return result;
}
async function checkUndeclaredExtensionInputs(reader, issues, extensionById, outputPaths, sourceById) {
  const folderOf = (file) => file.slice(0, file.lastIndexOf("/"));
  const ownFolders = new Set([...extensionById.values()].map(({ file }) => folderOf(file).toLowerCase()).filter((folder) => folder !== EDIT_FOLDERS.extensions));
  for (const { extension, file } of extensionById.values()) {
    const declared = /* @__PURE__ */ new Set([file.toLowerCase(), extension.output.path.toLowerCase()]);
    for (const input of extension.inputs) {
      if (input.kind === "file")
        declared.add(input.path.toLowerCase());
      else if (input.kind === "source") {
        const source = sourceById.get(input.sourceId)?.source;
        if (source?.kind === "asset")
          declared.add(source.path.toLowerCase());
      } else if (input.kind === "extension") {
        const upstream = extensionById.get(input.extensionId);
        if (upstream)
          declared.add(upstream.extension.output.path.toLowerCase());
      }
    }
    const checkPath = async (value2, where, what) => {
      for (const target of argumentPaths(value2)) {
        if (target === "outside") {
          issues.error("extension-path-outside", file, where, `${what} "${value2}" points outside the project folder; copy the file into the project (e.g. assets/ or the extension's folder) and declare it as an input`, extension.id);
          return;
        }
        const lower = target.toLowerCase();
        if (declared.has(lower))
          continue;
        const otherOutput = outputPaths.get(lower);
        if (otherOutput && otherOutput !== extension.id) {
          issues.error("undeclared-input", file, where, `${what} reads the output of extension "${otherOutput}"; declare it as input { "kind": "extension", "extensionId": "${otherOutput}" }`, extension.id);
          return;
        }
        if (await reader.exists(target)) {
          issues.error("undeclared-input", file, where, `${what} names the project file "${target}", which is not a declared input; add { "kind": "file", "path": "${target}" } to inputs`, extension.id);
          return;
        }
      }
    };
    if (/[\\/]/.test(extension.command.program))
      await checkPath(extension.command.program, "command.program", "the program");
    for (const [index, arg] of extension.command.args.entries())
      await checkPath(arg, `command.args[${index}]`, `argument ${index}`);
    const folder = folderOf(file);
    if (!reader.list || folder.toLowerCase() === EDIT_FOLDERS.extensions)
      continue;
    for (const candidate of await reader.list(folder)) {
      const lower = candidate.toLowerCase();
      if (declared.has(lower))
        continue;
      let parent = folderOf(lower);
      let nested = false;
      while (parent.length > folder.length) {
        if (ownFolders.has(parent))
          nested = true;
        parent = folderOf(parent);
      }
      if (nested)
        continue;
      issues.error("undeclared-input", file, "inputs", `"${candidate}" is in the folder of extension "${extension.id}" but not a declared input; declare every script and file the command reads, so reviews and the cache see changes`, extension.id);
    }
  }
}
function extensionInputClosure(roots, extensionById) {
  const extensions = /* @__PURE__ */ new Set();
  const sourceIds = /* @__PURE__ */ new Set();
  const queue = [...roots];
  while (queue.length) {
    const extensionId = queue.pop();
    if (extensions.has(extensionId))
      continue;
    extensions.add(extensionId);
    for (const input of extensionById.get(extensionId)?.extension.inputs ?? []) {
      if (input.kind === "source")
        sourceIds.add(input.sourceId);
      if (input.kind === "extension")
        queue.push(input.extensionId);
    }
  }
  return { extensions, sources: sourceIds };
}
function deriveEditVideoRefs(documents) {
  const used = /* @__PURE__ */ new Set();
  for (const item of documents.edit?.sequence ?? [])
    if (item.kind === "statement" && item.sourceId)
      used.add(item.sourceId);
  for (const item of documents.edit?.broll ?? [])
    if (item.sourceId)
      used.add(item.sourceId);
  const roots = [];
  for (const item of documents.edit?.sequence ?? [])
    if (item.kind === "scene" && item.extensionId)
      roots.push(item.extensionId);
  for (const extension of documents.extensions)
    if (extension.output.image)
      roots.push(extension.id);
  for (const track of [...documents.timeline?.video ?? [], ...documents.timeline?.audio ?? []]) {
    for (const clip of track.clips) {
      if (clip.sourceId)
        used.add(clip.sourceId);
      if (clip.extensionId)
        roots.push(clip.extensionId);
    }
  }
  const extensionById = new Map(documents.extensions.map((extension) => [extension.id, { extension }]));
  for (const sourceId of extensionInputClosure(roots, extensionById).sources)
    used.add(sourceId);
  const refs = /* @__PURE__ */ new Set();
  for (const source of documents.sources?.sources ?? []) {
    if (source.kind === "darkmind-video" && used.has(source.id))
      refs.add(normalizeCutProjectVideoId(source.videoId));
  }
  return [...refs].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
}

// ../shared/dist/editing-pipeline/explore-import.js
var ExploreCutlistError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ExploreCutlistError";
  }
};
var SCENE_TYPES = /* @__PURE__ */ new Set(["TITLE-CARD", "TITLE", "TRANSITION", "GRAPHIC", "TEXT-CARD", "LOWER-THIRD"]);
var BROLL_TYPES = /* @__PURE__ */ new Set(["B-ROLL", "BROLL", "CUTAWAY", "INSERT"]);
var MAX_TEXT = 2e4;
var GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function str(value2, max = MAX_TEXT) {
  if (typeof value2 === "number" && Number.isFinite(value2))
    return String(value2);
  if (typeof value2 !== "string")
    return null;
  return value2.length > max ? value2.slice(0, max) : value2;
}
function nonEmpty(value2) {
  return value2 && value2.trim() ? value2 : null;
}
function num(value2) {
  return typeof value2 === "number" && Number.isFinite(value2) ? value2 : null;
}
function originOf(clip) {
  return {
    kind: "explore-cutlist",
    clipNumber: num(clip.clipNumber),
    type: str(clip.type, 100),
    sourceFile: str(clip.sourceFile, 1e3),
    sourceVideoId: str(clip.sourceVideoId, 200),
    segmentId: str(clip.segmentId, 400),
    tcIn: str(clip.tcIn, 40),
    tcOut: str(clip.tcOut, 40),
    durationSeconds: num(clip.durationSeconds),
    tcApproximate: clip.tcApproximate === true,
    transcriptQuote: str(clip.transcriptQuote),
    contentDescription: str(clip.contentDescription),
    overlayText: str(clip.overlayText),
    editorialNotes: str(clip.editorialNotes),
    speakerName: str(clip.speakerName, 400),
    speakerRole: str(clip.speakerRole, 400)
  };
}
function pad(index, count2) {
  return String(index).padStart(Math.max(2, String(count2).length), "0");
}
function isGenerated(origin) {
  return origin.sourceVideoId?.trim().toUpperCase() === "GENERATED" || Boolean(origin.sourceFile?.trim().toUpperCase().startsWith("GENERATED_"));
}
function convertExploreCutlist(cutlist, options) {
  if (!cutlist || typeof cutlist !== "object" || Array.isArray(cutlist))
    throw new ExploreCutlistError("cutlist must be a JSON object");
  const data = cutlist;
  if (data.objectType !== "cutlist" || !Array.isArray(data.clips)) {
    throw new ExploreCutlistError('not an Explore cutlist (needs objectType "cutlist" and a clips array)');
  }
  const profileName = options.profile ?? "vertical-1080x1920-30";
  const profile = EDIT_OUTPUT_PROFILES[profileName];
  if (!profile)
    throw new ExploreCutlistError(`unknown output profile "${profileName}"`);
  const cutlistPath = options.cutlistPath ?? EDIT_DEFAULT_FILES.exploreCutlist;
  const warnings = [];
  const clips = data.clips.filter((clip, index) => {
    if (clip && typeof clip === "object" && !Array.isArray(clip))
      return true;
    warnings.push(`clips[${index}] is not an object and was skipped`);
    return false;
  });
  const classified = clips.map((clip) => {
    const origin = originOf(clip);
    const type = (origin.type ?? "").trim().toUpperCase().replace(/[\s_]+/g, "-");
    const kind = isGenerated(origin) || SCENE_TYPES.has(type) ? "scene" : BROLL_TYPES.has(type) ? "broll" : "statement";
    return { origin, kind };
  });
  const counts = { statement: 0, scene: 0, broll: 0 };
  for (const entry of classified)
    counts[entry.kind]++;
  const sourceIdByVideo = /* @__PURE__ */ new Map();
  const sources = [];
  const usedSourceIds2 = /* @__PURE__ */ new Set();
  const sourceFor = (origin, label2) => {
    const raw = origin.sourceVideoId?.trim() ?? "";
    if (!raw)
      return null;
    if (!GUID.test(raw)) {
      warnings.push(`${label2}: sourceVideoId "${raw}" is not a Dark Mind video ID; the source stays open`);
      return null;
    }
    const videoId = normalizeCutProjectVideoId(raw);
    const existing = sourceIdByVideo.get(videoId);
    if (existing)
      return existing;
    let id2 = `v-${videoId.slice(0, 8).toLowerCase()}`;
    for (let n = 2; usedSourceIds2.has(id2); n++)
      id2 = `v-${videoId.slice(0, 8).toLowerCase()}-${n}`;
    usedSourceIds2.add(id2);
    sourceIdByVideo.set(videoId, id2);
    const fileName = nonEmpty(origin.sourceFile);
    sources.push({ id: id2, kind: "darkmind-video", videoId, ...fileName ? { fileName: fileName.slice(0, 400), label: fileName.slice(0, 200) } : {} });
    return id2;
  };
  const sequence = [];
  const broll = [];
  let statementIndex = 0;
  let sceneIndex = 0;
  let brollIndex = 0;
  let approximate = 0;
  let missingSources = 0;
  classified.forEach(({ origin, kind }, index) => {
    const label2 = `clip ${origin.clipNumber ?? index + 1}`;
    if (origin.tcApproximate)
      approximate++;
    const unresolved2 = [];
    if (origin.tcApproximate)
      unresolved2.push("tc-approximate");
    if (kind === "scene") {
      const scene = {
        kind: "scene",
        id: `sc${pad(++sceneIndex, counts.scene)}`,
        description: (nonEmpty(origin.contentDescription) ?? nonEmpty(origin.overlayText) ?? origin.type ?? "Generated scene").slice(0, 5e3),
        text: nonEmpty(origin.overlayText)?.slice(0, 5e3) ?? null,
        extensionId: null,
        unresolved: [...unresolved2, "placeholder"],
        origin
      };
      sequence.push(scene);
      return;
    }
    const sourceId = sourceFor(origin, label2);
    if (!sourceId)
      missingSources++;
    if (kind === "broll") {
      const previous = sequence[sequence.length - 1];
      broll.push({
        id: `b${pad(++brollIndex, counts.broll)}`,
        sourceId,
        range: null,
        description: (nonEmpty(origin.contentDescription) ?? nonEmpty(origin.editorialNotes) ?? "").slice(0, 5e3),
        afterId: previous ? previous.id : null,
        unresolved: unresolved2,
        origin
      });
      return;
    }
    const quote = nonEmpty(origin.transcriptQuote)?.slice(0, 5e3) ?? null;
    if (quote)
      unresolved2.push("quote-unverified");
    const context = [nonEmpty(origin.contentDescription), nonEmpty(origin.editorialNotes) ? `Editorial notes: ${origin.editorialNotes}` : null].filter(Boolean).join("\n").slice(0, 5e3);
    const statement = {
      kind: "statement",
      id: `s${pad(++statementIndex, counts.statement)}`,
      sourceId,
      range: null,
      quote,
      context,
      ...origin.speakerName || origin.speakerRole ? { speaker: { name: origin.speakerName?.slice(0, 200) ?? null, role: origin.speakerRole?.slice(0, 200) ?? null } } : {},
      unresolved: unresolved2,
      origin
    };
    sequence.push(statement);
  });
  const cutlistTitle = nonEmpty(str(data.title, 200));
  const title = (options.title?.trim() || cutlistTitle || "Explore cutlist").slice(0, 200);
  const project = {
    schemaVersion: EDIT_SCHEMA_VERSION,
    kind: EDIT_PROJECT_KIND,
    title,
    output: { ...profile },
    duration: profileName === "vertical-1080x1920-30" ? { ...EDIT_REFERENCE_DURATION } : null,
    recipe: null,
    artifacts: {
      sources: EDIT_DEFAULT_FILES.sources,
      edit: EDIT_DEFAULT_FILES.edit,
      timeline: EDIT_DEFAULT_FILES.timeline,
      captions: EDIT_DEFAULT_FILES.captions,
      brief: EDIT_DEFAULT_FILES.brief
    },
    extensions: [],
    origin: {
      kind: "explore-cutlist",
      file: cutlistPath,
      sha256: options.cutlistSha256,
      converterVersion: EXPLORE_CUTLIST_CONVERTER_VERSION,
      importedAt: options.importedAt
    }
  };
  const edit = { schemaVersion: EDIT_SCHEMA_VERSION, sequence, broll };
  const sourcesFile = { schemaVersion: EDIT_SCHEMA_VERSION, sources };
  const description = nonEmpty(str(data.description));
  const message = nonEmpty(str(data.message));
  const estimate = num(data.totalDurationSeconds);
  const brief = [
    `# ${title}`,
    "",
    `Imported from the Explore cut list \`${cutlistPath}\` on ${options.importedAt.slice(0, 10)}. The cut list is a research result:`,
    "timecodes and quotes are approximate until they are resolved at the material (see `unresolved` in edit.json).",
    ...description ? ["", "## Description", "", description] : [],
    ...message ? ["", "## Explore message", "", message] : [],
    ...estimate !== null ? ["", "## Explore estimate", "", `${estimate} s, ${clips.length} clips`] : [],
    ""
  ].join("\n");
  return {
    files: { project, sources: sourcesFile, edit, brief },
    warnings,
    counts: { statements: counts.statement, scenes: counts.scene, broll: counts.broll, sources: sources.length, approximate, missingSources }
  };
}

// ../shared/dist/editing-pipeline/srt.js
function captionsToSrt(captions, fps) {
  const sorted = [...captions].sort((a, b) => a.start - b.start || a.end - b.end);
  const blocks = sorted.map((caption, index) => {
    const text3 = caption.text.replace(/\r\n?/g, "\n").trim().split("\n").join("\r\n");
    return `${index + 1}\r
${srtTimestamp(srtMillis(caption.start, fps))} --> ${srtTimestamp(srtMillis(caption.end, fps))}\r
${text3}\r
`;
  });
  return blocks.join("\r\n");
}

// ../shared/dist/editing-pipeline/caption-words.js
function normalizeWordText(text3) {
  return text3.normalize("NFKC").toLowerCase().replace(/[\u2018\u2019\u02bc]/g, "'").replace(/[^\p{L}\p{N}']/gu, "");
}
function alignTokens(a, b) {
  const n = a.length;
  const m = b.length;
  const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i2 = n - 1; i2 >= 0; i2--) {
    for (let j2 = m - 1; j2 >= 0; j2--) {
      table[i2][j2] = a[i2] !== "" && a[i2] === b[j2] ? table[i2 + 1][j2 + 1] + 1 : Math.max(table[i2 + 1][j2], table[i2][j2 + 1]);
    }
  }
  const pairs = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] !== "" && a[i] === b[j])
      pairs.push([i++, j++]);
    else if (table[i + 1][j] >= table[i][j + 1])
      i++;
    else
      j++;
  }
  return pairs;
}
function secondsQ(value2) {
  return rational(BigInt(Math.round(value2 * 1e3)), 1000n);
}
function spreadFrames(weights, from, to) {
  const total = weights.reduce((a, w) => a + w, 0) || 1;
  const span = to - from;
  const out = [];
  let cursor = from;
  let acc = 0;
  weights.forEach((w, i) => {
    acc += w;
    const remaining = weights.length - i - 1;
    let end = i === weights.length - 1 ? to : from + Math.round(span * acc / total);
    end = Math.min(Math.max(end, cursor + 1), to - remaining);
    out.push([cursor, end]);
    cursor = end;
  });
  return out;
}
function wordsValid(times, start, end) {
  let cursor = start;
  for (const [s, e] of times) {
    if (s < cursor || e <= s || e > end)
      return false;
    cursor = e;
  }
  return true;
}
function timeCaptionTokens(caption, recognised) {
  const tokens = caption.text.split(/\s+/).filter(Boolean);
  if (tokens.length === 0 || tokens.length > caption.end - caption.start)
    return null;
  const pairs = alignTokens(tokens.map(normalizeWordText), recognised.map((w) => normalizeWordText(w.text)));
  const anchor = new Map(pairs.map(([i, j]) => [i, [recognised[j].start, recognised[j].end]]));
  const times = new Array(tokens.length);
  for (let i = 0; i < tokens.length; ) {
    if (anchor.has(i)) {
      times[i] = anchor.get(i);
      i++;
      continue;
    }
    let k = i;
    while (k < tokens.length && !anchor.has(k))
      k++;
    const left = i > 0 ? times[i - 1][1] : caption.start;
    const right = k < tokens.length ? anchor.get(k)[0] : caption.end;
    const from = Math.max(caption.start, Math.min(left, caption.end));
    const to = Math.max(from, Math.min(right, caption.end));
    const run2 = tokens.slice(i, k).map((t) => t.length + 1);
    if (to - from >= run2.length)
      spreadFrames(run2, from, to).forEach((t, n) => times[i + n] = t);
    else
      run2.forEach((_, n) => times[i + n] = [from, from]);
    i = k;
  }
  let cursor = caption.start;
  for (const t of times) {
    t[0] = Math.min(Math.max(t[0], cursor), caption.end - 1);
    t[1] = Math.min(Math.max(t[1], t[0] + 1), caption.end);
    cursor = t[1];
  }
  let limit = caption.end;
  for (let i = times.length - 1; i >= 0; i--) {
    const t = times[i];
    t[1] = Math.min(t[1], limit);
    t[0] = Math.min(t[0], t[1] - 1);
    limit = t[0];
  }
  let spread = false;
  let result = times;
  if (!wordsValid(times, caption.start, caption.end)) {
    result = spreadFrames(tokens.map((t) => t.length + 1), caption.start, caption.end);
    spread = true;
  }
  return { tokens, times: result, matched: pairs.length, interpolated: tokens.length - pairs.length, spread };
}
function assignCaptionWords(documents, timings, options = {}) {
  const fps = parseRational(documents.project.output.fps);
  const tolerance = Number(roundHalfUpQ(mulQ(rational(1n, 4n), fps)));
  const only = options.captionIds?.length ? new Set(options.captionIds) : null;
  const sources = new Map((documents.sources?.sources ?? []).map((s) => [s.id, s]));
  const dialog = /* @__PURE__ */ new Map();
  for (const track of documents.timeline?.audio ?? []) {
    if (track.role !== "dialog")
      continue;
    for (const clip of track.clips)
      if (clip.statementId && clip.sourceId && !dialog.has(clip.statementId))
        dialog.set(clip.statementId, { sourceId: clip.sourceId, in: clip.in, out: clip.out, start: clip.start });
  }
  const wordsFor = (sourceId) => {
    const source = sources.get(sourceId);
    const videoId = source?.kind === "darkmind-video" ? normalizeCutProjectVideoId(source.videoId) : null;
    const sets = timings.filter((t) => t.sourceId === sourceId || videoId !== null && t.videoId !== void 0 && normalizeCutProjectVideoId(t.videoId) === videoId);
    if (!sets.length)
      return null;
    const unique = /* @__PURE__ */ new Map();
    for (const word of sets.flatMap((set) => set.words))
      unique.set(`${word.start}|${word.end}|${word.text}`, word);
    return [...unique.values()].sort((a, b) => a.start - b.start || a.end - b.end);
  };
  const report = [];
  const captions = documents.captions.captions.map((caption) => {
    if (only && !only.has(caption.id))
      return caption;
    const tokens = caption.text.split(/\s+/).filter(Boolean).length;
    const skip = (reason) => {
      report.push({ id: caption.id, status: "skipped", reason, tokens, matched: 0, interpolated: 0 });
      return caption;
    };
    if (!caption.statementId)
      return skip("scene caption (no speech, no word timings)");
    const clip = dialog.get(caption.statementId);
    if (!clip)
      return skip(`statement "${caption.statementId}" has no dialog clip on the timeline`);
    const words = wordsFor(clip.sourceId);
    if (!words)
      return skip(`no word timings for source "${clip.sourceId}" (get_word_timings of its video)`);
    const inExec = executedIn(parseRational(clip.in), fps);
    const srcIn = parseRational(clip.in);
    const srcOut = parseRational(clip.out);
    const frameOf = (seconds2) => clip.start + Number(roundHalfUpQ(mulQ(subQ(secondsQ(seconds2), inExec), fps)));
    const inside = (seconds2) => {
      const q = secondsQ(seconds2);
      return q.n * srcIn.d >= srcIn.n * q.d && q.n * srcOut.d <= srcOut.n * q.d;
    };
    const recognised = words.filter((w) => Number.isFinite(w.start) && Number.isFinite(w.end) && w.end > w.start && (inside(w.start) || inside(w.end))).map((w) => ({ text: w.text, start: frameOf(w.start), end: frameOf(w.end) })).filter((w) => w.end > caption.start - tolerance && w.start < caption.end + tolerance).sort((a, b) => a.start - b.start || a.end - b.end);
    const timed = timeCaptionTokens(caption, recognised);
    if (tokens > EDIT_CAPTION_MAX_WORDS)
      return skip(`caption has ${tokens} words, more than ${EDIT_CAPTION_MAX_WORDS}; split it`);
    if (!timed)
      return skip(tokens === 0 ? "caption has no words" : `caption is shorter (${caption.end - caption.start} frames) than its ${tokens} words`);
    const previous = caption.words ?? [];
    const emphasised = new Set(alignTokens(timed.tokens.map(normalizeWordText), previous.map((w) => normalizeWordText(w.text))).filter(([, j]) => previous[j].emphasis).map(([i]) => i));
    report.push({ id: caption.id, status: "assigned", tokens, matched: timed.matched, interpolated: timed.interpolated, ...timed.spread ? { spread: true } : {} });
    return {
      ...caption,
      words: timed.tokens.map((text3, i) => ({ text: text3, start: timed.times[i][0], end: timed.times[i][1], ...emphasised.has(i) ? { emphasis: true } : {} }))
    };
  });
  return { captions: { ...documents.captions, captions }, report };
}

// src/config.ts
var CONFIG_FILE = "darkmind.json";
var IGNORE_FILE = ".darkmindignore";
var STATE_DIR = CUT_PROJECT_LOCAL_STATE_DIR;
var GUID2 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var EMBEDDED_SERVER = "https://darkmind.cloud";
function statePaths(root) {
  const state = path2.join(root, STATE_DIR);
  return {
    state,
    manifest: path2.join(state, "manifest.json"),
    baseManifest: path2.join(state, "base-manifest.json"),
    hashes: path2.join(state, "hashes.json"),
    mediaTickets: path2.join(state, "media-tickets"),
    tmp: path2.join(state, "tmp")
  };
}
function isGuid(value2) {
  return typeof value2 === "string" && GUID2.test(value2);
}
function normalizeProjectId(value2) {
  if (!isGuid(value2.trim())) throw new CliError("invalid-input", `"${value2}" is not a project ID (GUID)`);
  return value2.trim().toLowerCase();
}
async function readConfig(root) {
  const file = path2.join(root, CONFIG_FILE);
  let raw;
  try {
    raw = await readJsonFile(file);
  } catch (error) {
    throw new CliError("invalid-config", `${CONFIG_FILE} is not valid JSON: ${error.message}`);
  }
  if (raw === null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) throw new CliError("invalid-config", `${CONFIG_FILE} must contain a JSON object`);
  const value2 = raw;
  const problems = [];
  if (!isGuid(value2.projectId)) problems.push("projectId must be a GUID");
  const baseVersion = value2.baseVersion ?? 0;
  if (!Number.isInteger(baseVersion) || baseVersion < 0) problems.push("baseVersion must be an integer >= 0");
  const videoRefs = value2.videoRefs ?? [];
  if (!Array.isArray(videoRefs)) problems.push("videoRefs must be an array of video IDs");
  else videoRefs.forEach((ref, index) => {
    if (!isGuid(ref)) problems.push(`videoRefs[${index}] must be a video ID (GUID)`);
  });
  if (value2.server !== void 0 && typeof value2.server !== "string") problems.push("server must be a URL");
  if (problems.length > 0) throw new CliError("invalid-config", `${CONFIG_FILE}: ${problems.join("; ")}`, { problems });
  return {
    ...value2,
    projectId: value2.projectId.toLowerCase(),
    baseVersion,
    videoRefs: [...new Set(videoRefs.map(normalizeCutProjectVideoId))]
  };
}
async function requireConfig(root) {
  const config = await readConfig(root);
  if (!config) {
    throw new CliError("not-initialized", `No ${CONFIG_FILE} in ${root}. Run "darkmind-agent init <projectId>" or "darkmind-agent download <ticket>" first.`);
  }
  return config;
}
async function writeConfig(root, config) {
  const { projectId, server, baseVersion, videoRefs, ...extra } = config;
  await writeJsonFile(path2.join(root, CONFIG_FILE), {
    projectId,
    ...server ? { server } : {},
    baseVersion,
    videoRefs: [...new Set(videoRefs.map(normalizeCutProjectVideoId))].sort(),
    ...extra
  });
}
function normalizeServer(value2) {
  let url;
  try {
    url = new URL(value2.trim());
  } catch {
    throw new CliError("invalid-server", `"${value2}" is not a URL`);
  }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) {
    throw new CliError("invalid-server", `Dark Mind URL must use https: ${value2}`);
  }
  return `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, "")}`;
}
function embeddedServer() {
  return /^https?:\/\//.test(EMBEDDED_SERVER) ? EMBEDDED_SERVER : void 0;
}
function resolveServer(option, config, env = process.env) {
  const candidate = option || env.DARKMIND_URL || config?.server || embeddedServer();
  if (!candidate) {
    throw new CliError(
      "no-server",
      `Dark Mind URL unknown. Pass --server https://<dark mind>, set DARKMIND_URL, or download the script from Dark Mind (/downloads/darkmind-agent.mjs).`
    );
  }
  return normalizeServer(candidate);
}

// src/http.ts
import http from "node:http";
import https from "node:https";

// src/version.ts
var AGENT_VERSION = true ? "0.18.0+52e644bfaa0d" : "0.0.0-dev";
var MIN_NODE_MAJOR = 20;
function nodeMajor(version = process.versions.node) {
  return Number.parseInt(version.split(".")[0], 10);
}

// src/http.ts
var HttpError = class extends Error {
  constructor(status2, code, message, body) {
    super(message);
    this.status = status2;
    this.code = code;
    this.body = body;
    this.name = "HttpError";
  }
};
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const client = target.protocol === "https:" ? https : http;
    const request = client.request(
      target,
      { method: options.method ?? "GET", headers: { "User-Agent": `darkmind-agent/${AGENT_VERSION}`, ...options.headers } },
      resolve
    );
    request.setTimeout(options.timeoutMs ?? 12e4, () => {
      const error = new Error(`No response from ${target.host} for ${Math.round((options.timeoutMs ?? 12e4) / 1e3)} s`);
      error.code = "ETIMEDOUT";
      request.destroy(error);
    });
    request.on("error", reject);
    const body = options.body;
    if (typeof body === "function") {
      const stream = body();
      stream.on("error", (error) => request.destroy(error));
      stream.pipe(request);
    } else {
      request.end(body);
    }
  });
}
async function readBody(response, limit = 64 * 1024 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of response) {
    total += chunk.length;
    if (total > limit) {
      response.destroy();
      throw new Error(`Response larger than ${limit} bytes`);
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
async function toHttpError(response, context) {
  let text3 = "";
  try {
    text3 = (await readBody(response, 256 * 1024)).toString("utf8");
  } catch {
  }
  const azureCode = response.headers["x-ms-error-code"];
  let json2;
  try {
    json2 = text3 ? JSON.parse(text3) : void 0;
  } catch {
    json2 = void 0;
  }
  const body = json2;
  const code = (typeof azureCode === "string" ? azureCode : void 0) ?? body?.code;
  const azureMessage = /<Message>([^<]*)<\/Message>/.exec(text3)?.[1]?.split("\n")[0];
  const detail = body?.message ?? azureMessage ?? (text3.length < 300 ? text3.trim() : "");
  return new HttpError(response.statusCode ?? 0, code, `${context}: HTTP ${response.statusCode}${code ? ` ${code}` : ""}${detail ? ` \u2013 ${detail}` : ""}`, json2);
}
var RETRYABLE_STATUS = /* @__PURE__ */ new Set([408, 429, 500, 502, 503, 504]);
var RETRYABLE_ERRNO = /* @__PURE__ */ new Set(["ECONNRESET", "ETIMEDOUT", "EPIPE", "ECONNREFUSED", "EAI_AGAIN", "ENETUNREACH", "ENOTFOUND", "UND_ERR_SOCKET", "ECONNABORTED"]);
function isRetryable(error) {
  if (error instanceof HttpError) return RETRYABLE_STATUS.has(error.status);
  const code = error?.code;
  return typeof code === "string" && RETRYABLE_ERRNO.has(code);
}
var retryConfig = { baseDelayMs: 1e3 };
async function withRetry(fn, options = {}) {
  const attempts = options.attempts ?? 4;
  const retryIf = options.retryIf ?? isRetryable;
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt >= attempts || !retryIf(error)) throw error;
      options.onRetry?.(error, attempt);
      await sleep(retryConfig.baseDelayMs * 2 ** (attempt - 1));
    }
  }
}

// src/skill.ts
import { promises as fs2 } from "node:fs";
import path3 from "node:path";
var SKILL_NAME = "darkmind-editing";
var SKILL_INFO_FILE = "skill.json";
async function detectSkill(scriptPath = process.argv[1]) {
  if (!scriptPath) return null;
  const folder = path3.dirname(path3.resolve(scriptPath));
  let parsed;
  try {
    parsed = JSON.parse(await fs2.readFile(path3.join(folder, SKILL_INFO_FILE), "utf8"));
  } catch {
    return null;
  }
  const value2 = parsed;
  if (value2?.name !== SKILL_NAME || typeof value2.version !== "string" || !value2.version || value2.version.length > 100) return null;
  return { name: SKILL_NAME, version: value2.version, folder, install: value2.install === "plugin" ? "plugin" : "zip" };
}

// src/transfer.ts
var TICKET_PATTERN = /^dmt_[A-Za-z0-9_-]{43}$/;
function checkTicket(ticket) {
  const value2 = ticket?.trim() ?? "";
  if (!TICKET_PATTERN.test(value2)) {
    throw new CliError("invalid-ticket", 'Not a transfer ticket (expected "dmt_" followed by 43 characters, as returned by the Dark Mind MCP tools).');
  }
  return value2;
}
var TICKET_HINTS = {
  "ticket-expired": "Ask Dark Mind for a new ticket (project_pull, project_push_begin, get_media_sources or get_brand_assets).",
  "ticket-not-found": "Check that the ticket was copied completely and that --server points to the Dark Mind that issued it.",
  "ticket-exhausted": "The ticket was redeemed too often; ask Dark Mind for a new one.",
  "push-expired": 'The push expired; run "darkmind-agent manifest" and project_push_begin again.'
};
async function redeemTicket(server, ticket) {
  const value2 = checkTicket(ticket);
  const url = `${server}/api/agent-transfer`;
  let text3;
  try {
    text3 = await withRetry(
      async () => {
        const response = await httpRequest(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ticket: value2 }),
          timeoutMs: 12e4
        });
        if ((response.statusCode ?? 0) >= 400) throw await toHttpError(response, "Ticket redemption failed");
        return (await readBody(response)).toString("utf8");
      },
      { attempts: 3 }
    );
  } catch (error) {
    if (error instanceof HttpError) {
      const code = error.code ?? `http-${error.status}`;
      const body = error.body;
      const hint = TICKET_HINTS[code];
      throw new CliError(code, `${body?.message ?? error.message}${hint ? ` ${hint}` : ""}`, {
        status: error.status,
        ...body?.details !== void 0 ? { details: body.details } : {}
      });
    }
    throw new CliError("network-error", `Cannot reach ${server}: ${error.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(text3);
  } catch {
    parsed = void 0;
  }
  if (!parsed || typeof parsed !== "object" || !["push", "pull", "media", "brand-assets"].includes(parsed.kind ?? "")) {
    throw new CliError("unexpected-response", `${server} did not answer like Dark Mind; check --server / DARKMIND_URL.`);
  }
  return parsed;
}
function expectKind(transfer, kind, command) {
  if (transfer.kind !== kind) {
    throw new CliError("wrong-ticket-kind", `This is a ${transfer.kind} ticket; "${command}" needs a ${kind} ticket.`);
  }
  return transfer;
}

// src/unzip.ts
import { inflateRawSync } from "node:zlib";
var EOCD = 101010256;
var CENTRAL = 33639248;
var LOCAL = 67324752;
function safeEntryName(name) {
  if (!name || name.length > 400 || name.includes("\\") || name.startsWith("/") || /^[A-Za-z]:/.test(name) || name.includes("\0")) return false;
  return name.split("/").every((part) => part !== "" && part !== "." && part !== "..");
}
function readZip(buffer, label2 = "brand assets archive") {
  const fail = (message) => {
    throw new CliError("invalid-archive", `The ${label2} is damaged: ${message}`);
  };
  let eocd = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 22 - 65535); i--) {
    if (buffer.readUInt32LE(i) === EOCD) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) fail("no end of central directory");
  const count2 = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const entries = [];
  for (let i = 0; i < count2; i++) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== CENTRAL) fail("bad central directory entry");
    const method = buffer.readUInt16LE(offset + 10);
    const compressed = buffer.readUInt32LE(offset + 20);
    const size = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extra = buffer.readUInt16LE(offset + 30);
    const comment = buffer.readUInt16LE(offset + 32);
    const local = buffer.readUInt32LE(offset + 42);
    const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    offset += 46 + nameLength + extra + comment;
    if (name.endsWith("/")) continue;
    if (!safeEntryName(name)) fail(`unsafe entry name "${name}"`);
    if (local + 30 > buffer.length || buffer.readUInt32LE(local) !== LOCAL) fail(`bad local header of ${name}`);
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    const raw = buffer.subarray(start, start + compressed);
    if (raw.length !== compressed) fail(`${name} is truncated`);
    const data = method === 0 ? Buffer.from(raw) : method === 8 ? inflateRawSync(raw) : fail(`${name} uses compression method ${method}`);
    if (data.length !== size) fail(`${name} has ${data.length} bytes instead of ${size}`);
    entries.push({ name, data });
  }
  return entries;
}

// src/commands/brand-assets.ts
var BRAND_ASSETS_MARKER = ".darkmind-brand-assets.json";
var SKILL_BRAND_ASSETS_DIR = path4.join("brand", "assets");
var MAX_ARCHIVE_BYTES = 200 * 1024 * 1024;
function userHome(env, platform = process.platform) {
  return (platform === "win32" ? env.USERPROFILE : env.HOME) || env.HOME || os.homedir();
}
function brandAssetsHome(env, platform = process.platform) {
  return env.DARKMIND_BRAND_ASSETS ? path4.resolve(env.DARKMIND_BRAND_ASSETS) : path4.join(userHome(env, platform), ".darkmind", "brand-assets");
}
async function legacyBrandAssetDirs(env, scriptPath, platform) {
  const home = userHome(env, platform);
  const skill = await detectSkill(scriptPath);
  return [
    ...skill ? [path4.join(skill.folder, SKILL_BRAND_ASSETS_DIR)] : [],
    path4.join(home, ".darkmind", "marketplace", "plugins", "darkmind", "skills", SKILL_NAME, SKILL_BRAND_ASSETS_DIR),
    path4.join(env.COPILOT_HOME || path4.join(home, ".copilot"), "skills", SKILL_NAME, SKILL_BRAND_ASSETS_DIR),
    path4.join(env.CLAUDE_CONFIG_DIR || path4.join(home, ".claude"), "skills", SKILL_NAME, SKILL_BRAND_ASSETS_DIR)
  ];
}
async function migrateBrandAssets(env, scriptPath = process.argv[1], platform = process.platform) {
  const dir = brandAssetsHome(env, platform);
  const marker = await installedBrandAssets(dir);
  if (marker) return { dir, marker };
  for (const from of await legacyBrandAssetDirs(env, scriptPath, platform)) {
    if (path4.resolve(from) === path4.resolve(dir) || !await installedBrandAssets(from)) continue;
    const staging = `${dir}.tmp-${process.pid}`;
    await fs3.rm(staging, { recursive: true, force: true });
    await fs3.mkdir(path4.dirname(dir), { recursive: true });
    await fs3.cp(from, staging, { recursive: true });
    await fs3.rm(dir, { recursive: true, force: true });
    await fs3.rename(staging, dir);
    return { dir, marker: await installedBrandAssets(dir), migratedFrom: from };
  }
  return { dir, marker: null };
}
async function installedBrandAssets(dir) {
  const marker = await readJsonFile(path4.join(dir, BRAND_ASSETS_MARKER)).catch(() => null);
  if (!marker || typeof marker.sha256 !== "string") return null;
  return await fs3.stat(path4.join(dir, "logo", "logo.json")).catch(() => null) ? marker : null;
}
async function brandAssetsCommand(ctx, ticket, options) {
  const value2 = checkTicket(ticket);
  const target = options.to ? path4.resolve(ctx.root, options.to) : brandAssetsHome(ctx.env);
  const server = resolveServer(ctx.server, await readConfig(ctx.root).catch(() => null), ctx.env);
  const transfer = expectKind(await redeemTicket(server, value2), "brand-assets", "brand-assets");
  const installed = await installedBrandAssets(target);
  if (installed?.sha256 === transfer.sha256 && !options.force) {
    return {
      data: { status: "unchanged", dir: target, sha256: transfer.sha256, files: installed.files },
      text: `brand assets unchanged in ${target} (${installed.files} files)`
    };
  }
  ctx.progress(`downloading brand assets (${formatBytes(transfer.size)})`);
  let archive;
  let announced;
  try {
    ({ archive, announced } = await withRetry(async () => {
      const response = await httpRequest(`${server}${transfer.download}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/zip" },
        body: JSON.stringify({ ticket: value2 }),
        timeoutMs: 12e4
      });
      if ((response.statusCode ?? 0) >= 400) throw await toHttpError(response, "Brand assets download failed");
      const header = response.headers["x-darkmind-sha256"];
      return { archive: await readBody(response, MAX_ARCHIVE_BYTES), announced: typeof header === "string" ? header : void 0 };
    }, { attempts: 3 }));
  } catch (error) {
    if (error instanceof HttpError) throw new CliError(error.code ?? `http-${error.status}`, error.message, { status: error.status });
    throw new CliError("network-error", `Cannot reach ${server}: ${error.message}`);
  }
  const sha2563 = createHash("sha256").update(archive).digest("hex");
  if (announced && announced !== sha2563) throw new CliError("download-corrupt", "The brand assets archive does not match its checksum; run the command again with a new ticket.");
  const entries = readZip(archive);
  if (!entries.some((entry) => entry.name === "logo/logo.json")) throw new CliError("invalid-archive", "The archive contains no brand assets (logo/logo.json missing).");
  const staging = `${target}.tmp-${process.pid}`;
  await fs3.rm(staging, { recursive: true, force: true });
  for (const entry of entries) {
    const file = path4.join(staging, ...entry.name.split("/"));
    await fs3.mkdir(path4.dirname(file), { recursive: true });
    await fs3.writeFile(file, entry.data);
  }
  const marker = { sha256: sha2563, files: entries.length, server, installedAt: (/* @__PURE__ */ new Date()).toISOString() };
  await fs3.writeFile(path4.join(staging, BRAND_ASSETS_MARKER), `${JSON.stringify(marker, null, 2)}
`);
  await fs3.rm(target, { recursive: true, force: true });
  await fs3.mkdir(path4.dirname(target), { recursive: true });
  await fs3.rename(staging, target);
  return {
    data: { status: "installed", dir: target, sha256: sha2563, files: entries.length, bytes: archive.length, next: "node <skill>/brand/tools/add-block.mjs <block> --project <project folder> finds them there (~/.darkmind/brand-assets or DARKMIND_BRAND_ASSETS)" },
    text: `brand assets installed in ${target} (${entries.length} files, ${formatBytes(archive.length)}); licensed for internal use only \u2013 never pass them on`
  };
}

// src/commands/cache.ts
import { promises as fs5 } from "node:fs";

// src/context.ts
function capList(items, max = 100) {
  return items.length > max ? { items: items.slice(0, max), truncated: items.length - max } : { items };
}

// src/media-cache.ts
import { promises as fs4 } from "node:fs";
import os2 from "node:os";
import path5 from "node:path";

// src/hash.ts
import { createHash as createHash2 } from "node:crypto";
import { createReadStream } from "node:fs";
async function hashFile(absolutePath, options = {}) {
  const sha2 = createHash2("sha256");
  const md5 = options.md5 ? createHash2("md5") : null;
  let size = 0;
  const stream = createReadStream(absolutePath, { start: options.start, end: options.end, highWaterMark: 1024 * 1024 });
  for await (const chunk of stream) {
    const buffer = chunk;
    sha2.update(buffer);
    md5?.update(buffer);
    size += buffer.length;
  }
  return { sha256: sha2.digest("hex"), size, ...md5 ? { md5: md5.digest("base64") } : {} };
}
function sha256Hex(data) {
  return createHash2("sha256").update(data).digest("hex");
}
var RACY_WINDOW_MS = 2e3;
var HashCache = class _HashCache {
  constructor(file, entries) {
    this.file = file;
    this.entries = entries;
  }
  used = /* @__PURE__ */ new Map();
  dirty = false;
  static async load(file) {
    let data = null;
    try {
      data = await readJsonFile(file);
    } catch {
      data = null;
    }
    const entries = new Map(data?.version === 1 ? Object.entries(data.entries ?? {}) : []);
    return new _HashCache(file, entries);
  }
  /** Cached SHA-256, or null if the file may have changed since it was hashed. */
  lookup(path34, size, mtimeMs) {
    const entry = this.entries.get(path34);
    if (!entry || entry.size !== size || entry.mtimeMs !== mtimeMs) return null;
    if (entry.hashedAt - mtimeMs < RACY_WINDOW_MS) return null;
    this.used.set(path34, entry);
    return entry.sha256;
  }
  record(path34, size, mtimeMs, sha2563, hashedAt) {
    const entry = { size, mtimeMs, sha256: sha2563, hashedAt };
    this.entries.set(path34, entry);
    this.used.set(path34, entry);
    this.dirty = true;
  }
  /** Hash of a file via the cache; hashes and records it on a miss. */
  async hash(path34, absolutePath, size, mtimeMs) {
    const cached = this.lookup(path34, size, mtimeMs);
    if (cached) return cached;
    const hashedAt = Date.now();
    const result = await hashFile(absolutePath);
    if (result.size === size) this.record(path34, size, mtimeMs, result.sha256, hashedAt);
    return result.sha256;
  }
  /** Writes the cache; `prune` (after a full scan) keeps only the entries used in this run. */
  async save(options = {}) {
    if (options.prune) {
      if (!this.dirty && this.used.size === this.entries.size) return;
    } else if (!this.dirty) {
      return;
    }
    const source = options.prune ? this.used : this.entries;
    const entries = {};
    for (const [path34, entry] of [...source].sort(([a], [b]) => a < b ? -1 : 1)) entries[path34] = entry;
    await writeJsonFile(this.file, { version: 1, entries });
  }
};

// src/media-cache.ts
var CACHE_KINDS = ["original", "proxy"];
function mediaCacheDir(env, platform = process.platform) {
  const value2 = env.DARKMIND_MEDIA_CACHE?.trim();
  if (value2) return /^(off|none|0|false|no)$/i.test(value2) ? { dir: null, reason: "DARKMIND_MEDIA_CACHE=off" } : { dir: path5.resolve(value2) };
  const home = platform === "win32" ? env.USERPROFILE || env.HOME : env.HOME;
  return home ? { dir: path5.join(home, ".darkmind", "media") } : { dir: null, reason: "no home folder (USERPROFILE/HOME) in the environment" };
}
function cacheKey(identity) {
  const canonical2 = (value2) => value2 && typeof value2 === "object" && !Array.isArray(value2) ? Object.fromEntries(Object.keys(value2).sort().map((k) => [k, canonical2(value2[k])])) : value2;
  return sha256Hex(JSON.stringify(canonical2(identity))).slice(0, 20);
}
function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}
async function removeFile(file) {
  await fs4.rm(file, { force: true });
}
async function placeFromCache(source, target) {
  await fs4.mkdir(path5.dirname(target), { recursive: true });
  await removeFile(target);
  try {
    await fs4.link(source, target);
    return "hardlink";
  } catch {
  }
  try {
    await fs4.symlink(source, target, "file");
    return "symlink";
  } catch {
  }
  const temp = `${target}.copy.part`;
  await fs4.copyFile(source, temp);
  await renameWithRetry(temp, target);
  return "copy";
}
var MediaCache = class {
  constructor(dir) {
    this.dir = dir;
  }
  videoDir(kind, videoId) {
    return path5.join(this.dir, kind, normalizeCutProjectVideoId(videoId));
  }
  paths(kind, videoId, key, ext) {
    const dir = this.videoDir(kind, videoId);
    return { dir, file: path5.join(dir, `${key}${ext}`), entry: path5.join(dir, `${key}.json`), lock: path5.join(dir, `${key}.lock`) };
  }
  /** The cached content, if complete (entry present, size as recorded). */
  async lookup(kind, videoId, key) {
    const dir = this.videoDir(kind, videoId);
    const entry = await readJsonFile(path5.join(dir, `${key}.json`)).catch(() => null);
    if (entry?.version !== 1 || entry.key !== key || typeof entry.file !== "string") return null;
    const file = path5.join(dir, path5.basename(entry.file));
    const stat = await fs4.stat(file).catch(() => null);
    if (!stat?.isFile() || stat.size !== entry.size) return null;
    return { entry, file };
  }
  /**
   * The cached content, filled by `fill(target)` under a lock if missing. Another darkmind-agent filling the same
   * entry is waited for; a lock of a process that no longer runs is taken over (the download resumes).
   */
  async obtain(kind, videoId, key, ext, meta, fill, options = {}) {
    const p = this.paths(kind, videoId, key, ext);
    if (!options.force) {
      const hit = await this.lookup(kind, videoId, key);
      if (hit) return { ...hit, stored: false };
    }
    await fs4.mkdir(p.dir, { recursive: true });
    return this.withLock(p.lock, options, async () => {
      if (!options.force) {
        const hit = await this.lookup(kind, videoId, key);
        if (hit) return { ...hit, stored: false };
      } else {
        await removeFile(p.entry);
        await removeFile(p.file);
      }
      await fill(p.file);
      const stat = await fs4.stat(p.file);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const entry = {
        version: 1,
        kind,
        videoId: normalizeCutProjectVideoId(videoId),
        key,
        file: path5.basename(p.file),
        size: stat.size,
        identity: meta.identity,
        fileName: meta.fileName,
        createdAt: now,
        lastUsedAt: now,
        agentVersion: AGENT_VERSION
      };
      await writeJsonFile(p.entry, entry);
      return { entry, file: p.file, stored: true };
    });
  }
  /** Records use (and optionally the SHA-256) of an entry; failures are ignored (the cache stays usable). */
  async update(entry, change = {}) {
    const next = { ...entry, ...change, lastUsedAt: (/* @__PURE__ */ new Date()).toISOString() };
    await writeJsonFile(path5.join(this.videoDir(entry.kind, entry.videoId), `${entry.key}.json`), next).catch(() => void 0);
    return next;
  }
  /** Adds an existing complete file (e.g. an original loaded before the cache existed) by hard link only. */
  async adopt(kind, videoId, key, ext, meta, source) {
    if (await this.lookup(kind, videoId, key)) return false;
    const p = this.paths(kind, videoId, key, ext);
    await fs4.mkdir(p.dir, { recursive: true });
    try {
      await removeFile(p.file);
      await fs4.link(source, p.file);
    } catch {
      return false;
    }
    const stat = await fs4.stat(p.file);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await writeJsonFile(p.entry, {
      version: 1,
      kind,
      videoId: normalizeCutProjectVideoId(videoId),
      key,
      file: path5.basename(p.file),
      size: stat.size,
      identity: meta.identity,
      fileName: meta.fileName,
      createdAt: now,
      lastUsedAt: now,
      agentVersion: AGENT_VERSION
    });
    return true;
  }
  /** Every entry and interrupted download. */
  async list() {
    const items = [];
    for (const kind of CACHE_KINDS) {
      const kindDir = path5.join(this.dir, kind);
      for (const video of await fs4.readdir(kindDir).catch(() => [])) {
        const dir = path5.join(kindDir, video);
        const names = await fs4.readdir(dir).catch(() => []);
        const covered = /* @__PURE__ */ new Set();
        for (const name of names.filter((n) => n.endsWith(".json") && !n.endsWith(".part.json"))) {
          const entry = await readJsonFile(path5.join(dir, name)).catch(() => null);
          if (entry?.version !== 1) continue;
          const file = path5.join(dir, path5.basename(entry.file));
          const stat = await fs4.stat(file).catch(() => null);
          if (!stat) continue;
          covered.add(path5.basename(entry.file).toLowerCase());
          items.push({ kind, videoId: entry.videoId, key: entry.key, fileName: entry.fileName, path: file, size: stat.size, links: stat.nlink || 1, createdAt: entry.createdAt, lastUsedAt: entry.lastUsedAt, partial: false });
        }
        for (const name of names.filter((n) => n.endsWith(".part"))) {
          const stat = await fs4.stat(path5.join(dir, name)).catch(() => null);
          if (!stat) continue;
          const key = name.split(".")[0];
          items.push({ kind, videoId: video, key, fileName: null, path: path5.join(dir, name), size: stat.size, links: 1, createdAt: null, lastUsedAt: stat.mtime.toISOString(), partial: true });
        }
      }
    }
    return items.sort((a, b) => a.kind === b.kind ? a.videoId === b.videoId ? a.key < b.key ? -1 : 1 : a.videoId < b.videoId ? -1 : 1 : a.kind < b.kind ? -1 : 1);
  }
  /** Removes an entry (content, entry file and partial download). Project hard links keep their data. */
  async remove(item) {
    const dir = this.videoDir(item.kind, item.videoId);
    const lock = path5.join(dir, `${item.key}.lock`);
    const holder = await readJsonFile(lock).catch(() => null);
    if (holder && (holder.host !== os2.hostname() || isAlive(holder.pid))) {
      throw new CliError("media-cache-locked", `${item.videoId} is being loaded into the media cache by another darkmind-agent (process ${holder.pid}); try again later.`);
    }
    await removeFile(item.path);
    if (item.partial) await removeFile(`${item.path}.json`);
    else {
      await removeFile(path5.join(dir, `${item.key}.json`));
      for (const name of await fs4.readdir(dir).catch(() => [])) {
        if (name.startsWith(`${item.key}.`) && (name.endsWith(".part") || name.endsWith(".part.json"))) await removeFile(path5.join(dir, name));
      }
    }
    await removeFile(lock);
    await fs4.rmdir(dir).catch(() => void 0);
  }
  async withLock(lock, options, fn) {
    const deadline = Date.now() + (options.lockTimeoutMs ?? 6 * 36e5);
    let announced = false;
    for (; ; ) {
      try {
        const handle = await fs4.open(lock, "wx");
        try {
          await handle.writeFile(JSON.stringify({ pid: process.pid, host: os2.hostname(), since: (/* @__PURE__ */ new Date()).toISOString() }));
        } finally {
          await handle.close();
        }
        break;
      } catch (error) {
        if (error.code !== "EEXIST") throw error;
        const holder = await readJsonFile(lock).catch(() => null);
        const age = Date.now() - ((await fs4.stat(lock).catch(() => null))?.mtimeMs ?? 0);
        const stale = holder ? holder.host === os2.hostname() ? !isAlive(holder.pid) : age > 24 * 36e5 : age > 3e4;
        if (stale) {
          await removeFile(lock);
          continue;
        }
        if (Date.now() > deadline) {
          throw new CliError("media-cache-locked", `Another darkmind-agent${holder ? ` (process ${holder.pid})` : ""} is still loading this video into the media cache (${lock}).`);
        }
        if (!announced) {
          options.progress?.(`waiting for another darkmind-agent${holder ? ` (process ${holder.pid})` : ""} that loads the same video into the media cache`);
          announced = true;
        }
        await sleep(options.pollMs ?? 2e3);
      }
    }
    try {
      return await fn();
    } finally {
      await removeFile(lock);
    }
  }
};
function openMediaCache(env) {
  const { dir } = mediaCacheDir(env);
  return dir ? new MediaCache(dir) : null;
}

// src/commands/cache.ts
function summary(items) {
  const total = (list2) => list2.reduce((sum, item) => sum + item.size, 0);
  return Object.fromEntries(
    CACHE_KINDS.map((kind) => {
      const complete = items.filter((item) => item.kind === kind && !item.partial);
      const partial = items.filter((item) => item.kind === kind && item.partial);
      const linked = complete.filter((item) => item.links > 1);
      return [kind, { entries: complete.length, bytes: total(complete), linkedEntries: linked.length, partialDownloads: partial.length, partialBytes: total(partial) }];
    })
  );
}
function describe(item) {
  return {
    kind: item.kind,
    videoId: item.videoId,
    fileName: item.fileName,
    bytes: item.size,
    projectLinks: Math.max(0, item.links - 1),
    lastUsedAt: item.lastUsedAt,
    ...item.partial ? { partial: true } : {}
  };
}
async function freeBytes(dir) {
  let probe2 = dir;
  for (; ; ) {
    const stat = await fs5.statfs(probe2).catch(() => null);
    if (stat) return Number(stat.bavail) * Number(stat.bsize);
    const parent = probe2.replace(/[\\/][^\\/]+[\\/]?$/, "");
    if (!parent || parent === probe2) return null;
    probe2 = parent;
  }
}
async function cacheCommand(ctx, sub, options = {}) {
  const { dir, reason } = mediaCacheDir(ctx.env);
  if (!dir) {
    return { data: { dir: null, enabled: false, reason }, text: `media cache: off (${reason})` };
  }
  const cache = new MediaCache(dir);
  const items = await cache.list();
  if (!sub || sub === "status") {
    const kinds = summary(items);
    const free = await freeBytes(dir);
    const listed2 = capList(items.map(describe));
    return {
      data: { dir, enabled: true, ...kinds, freeBytes: free, items: listed2.items, ...listed2.truncated ? { truncated: listed2.truncated } : {} },
      text: [
        `media cache: ${dir}${free !== null ? ` (${formatBytes(free)} free on the drive)` : ""}`,
        ...CACHE_KINDS.map((kind) => {
          const k = kinds[kind];
          return `  ${kind.padEnd(8)} ${k.entries} file(s), ${formatBytes(k.bytes)}; ${k.linkedEntries} linked into project folders${k.partialDownloads ? `; ${k.partialDownloads} interrupted download(s), ${formatBytes(k.partialBytes)}` : ""}`;
        }),
        ...listed2.items.map((item) => `  ${item.kind.padEnd(8)} ${item.videoId} ${formatBytes(item.bytes).padStart(8)} ${item.partial ? "interrupted" : `${item.projectLinks} link(s)`}  last used ${item.lastUsedAt ?? "\u2013"}  ${item.fileName ?? ""}`),
        ...listed2.truncated ? [`  \u2026 ${listed2.truncated} more (--json)`] : [],
        'Remove entries with "darkmind-agent cache prune" (--unused, --older-than <days>, --video <id>, --all).'
      ].join("\n")
    };
  }
  if (sub !== "prune") throw new CliError("usage", "Usage: darkmind-agent cache [status] | cache prune [--unused] [--older-than <days>] [--video <id>]... [--kind original|proxy] [--all] [--print]");
  if (options.kind !== void 0 && !CACHE_KINDS.includes(options.kind)) throw new CliError("usage", "--kind must be original or proxy");
  const videos = (options.videos ?? []).map(normalizeCutProjectVideoId);
  if (!options.all && !options.unused && options.olderThanDays === void 0 && videos.length === 0) {
    throw new CliError("usage", "cache prune needs a selection: --unused, --older-than <days>, --video <id> or --all (with --kind for one kind).");
  }
  const cutoff = options.olderThanDays === void 0 ? null : Date.now() - options.olderThanDays * 864e5;
  const selected = items.filter((item) => {
    if (options.kind && item.kind !== options.kind) return false;
    if (videos.length && !videos.includes(normalizeCutProjectVideoId(item.videoId))) return false;
    if (options.unused && item.links > 1) return false;
    if (cutoff !== null && Date.parse(item.lastUsedAt ?? "") > cutoff) return false;
    return true;
  });
  const removed = [];
  const failed = [];
  if (!options.print) {
    for (const item of selected) {
      try {
        await cache.remove(item);
        removed.push(item);
      } catch (error) {
        failed.push({ videoId: item.videoId, kind: item.kind, message: error.message });
      }
    }
  }
  const affected = options.print ? selected : removed;
  const freed = affected.filter((item) => item.links <= 1).reduce((sum, item) => sum + item.size, 0);
  const stillLinked = affected.filter((item) => item.links > 1);
  return {
    data: { dir, dryRun: Boolean(options.print), removed: affected.map(describe), freedBytes: freed, stillLinkedInProjects: stillLinked.length, failed },
    text: [
      `${options.print ? "would remove" : "removed"} ${affected.length} cache entr${affected.length === 1 ? "y" : "ies"} from ${dir}, ${formatBytes(freed)} ${options.print ? "would be freed" : "freed"}${stillLinked.length ? `; ${stillLinked.length} stay on disk as long as project folders link to them` : ""}.`,
      ...affected.map((item) => `  ${item.kind.padEnd(8)} ${item.videoId} ${formatBytes(item.size)}${item.links > 1 ? ` (${item.links - 1} project link(s))` : ""}`),
      ...failed.map((failure) => `  failed   ${failure.videoId}: ${failure.message}`)
    ].join("\n"),
    exitCode: failed.length ? 1 : 0
  };
}

// src/commands/doctor.ts
import { promises as fs7 } from "node:fs";
import path8 from "node:path";

// src/ffmpeg.ts
import { spawn } from "node:child_process";
import { statSync } from "node:fs";
import path6 from "node:path";
var AbortedError = class extends Error {
  constructor() {
    super("aborted");
    this.name = "AbortedError";
  }
};
function spawnChild(command, args, options, onStdout) {
  return new Promise((resolve, reject) => {
    if (options.signal?.aborted) {
      reject(new AbortedError());
      return;
    }
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true, ...options.cwd ? { cwd: options.cwd } : {} });
    let stderr = "";
    let aborted = false;
    child.stdout.on("data", onStdout);
    child.stderr.setEncoding("utf8").on("data", (chunk) => {
      if (stderr.length < 64 * 1024) stderr += chunk;
    });
    const onAbort = () => {
      aborted = true;
      child.kill("SIGKILL");
    };
    options.signal?.addEventListener("abort", onAbort, { once: true });
    const timer = options.timeoutMs ? setTimeout(() => child.kill("SIGKILL"), options.timeoutMs) : null;
    const done = () => {
      if (timer) clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
    };
    child.on("error", (error) => {
      done();
      reject(error);
    });
    child.on("close", (code) => {
      done();
      if (aborted) reject(new AbortedError());
      else resolve({ code, stderr });
    });
  });
}
var runProcess = async (command, args, options = {}) => {
  const chunks = [];
  const { code, stderr } = await spawnChild(command, args, options, (chunk) => chunks.push(chunk));
  return { code, stdout: Buffer.concat(chunks).toString("utf8"), stderr };
};
async function runBinary(command, args, options = {}) {
  const chunks = [];
  let size = 0;
  const max = options.maxBytes ?? 1024 ** 3;
  let tooLarge = false;
  const { code, stderr } = await spawnChild(command, args, options, (chunk) => {
    size += chunk.length;
    if (size > max) tooLarge = true;
    else chunks.push(chunk);
  });
  if (tooLarge) throw new Error(`${command} produced more than ${max} bytes`);
  return { code, stdout: Buffer.concat(chunks), stderr };
}
function defaultTools(env = process.env) {
  return { ffmpeg: env.DARKMIND_FFMPEG || resolveOnPath("ffmpeg", env), ffprobe: env.DARKMIND_FFPROBE || resolveOnPath("ffprobe", env), run: runProcess, binary: runBinary };
}
function resolveOnPath(program, env = process.env) {
  const key = Object.keys(env).find((k) => k.toUpperCase() === "PATH");
  const dirs = (key ? env[key] ?? "" : "").split(path6.delimiter).map((d) => d.replace(/^"|"$/g, "")).filter((d) => d && path6.isAbsolute(d));
  const windows = process.platform === "win32";
  const suffixes = windows ? [".exe", ".com"] : [""];
  for (const dir of dirs) {
    for (const suffix of suffixes) {
      const candidate = path6.join(dir, `${program}${suffix}`);
      try {
        if (statSync(candidate).isFile()) return candidate;
      } catch {
      }
    }
  }
  return program;
}
async function toolVersion(tools, tool) {
  try {
    const result = await tools.run(tools[tool], ["-hide_banner", "-version"], { timeoutMs: 15e3 });
    if (result.code !== 0) return null;
    return result.stdout.split(/\r?\n/)[0]?.replace(/\s+Copyright.*$/, "").trim() || tool;
  } catch {
    return null;
  }
}
async function probe(tools, file) {
  const result = await tools.run(tools.ffprobe, ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", file], {
    timeoutMs: 6e4
  });
  if (result.code !== 0) throw new Error(`ffprobe failed: ${result.stderr.trim().split(/\r?\n/).pop() ?? `exit ${result.code}`}`);
  const data = JSON.parse(result.stdout || "{}");
  const video = data.streams?.find((stream) => stream.codec_type === "video");
  const duration = Number(data.format?.duration);
  return {
    durationSeconds: Number.isFinite(duration) ? duration : null,
    width: video?.width ?? null,
    height: video?.height ?? null,
    hasVideo: Boolean(video),
    hasAudio: Boolean(data.streams?.some((stream) => stream.codec_type === "audio"))
  };
}

// src/pipeline/brand-trust.ts
import { spawn as spawn2 } from "node:child_process";
import { promises as fs6 } from "node:fs";
import path7 from "node:path";
var BRAND_VENDOR = "extensions/brand-pack";
var RUNNER = `${BRAND_VENDOR}/lib/render.mjs`;
var ENTRY = /^extensions\/brand-pack\/blocks\/([a-z0-9_]+)\/(?:scene\.html|block\.json)$/;
var ALLOWED_TOOLS = /* @__PURE__ */ new Set(["node", "ffmpeg", "npm:playwright-core"]);
var NPM_TIMEOUT_MS = 10 * 6e4;
function envValue(env, name) {
  if (env[name] !== void 0) return env[name];
  const key = Object.keys(env).find((k) => k.toUpperCase() === name.toUpperCase());
  return key ? env[key] : void 0;
}
async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await fs6.readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const full = path7.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full, base));
    else if (entry.isFile()) out.push(path7.relative(base, full).split(path7.sep).join("/"));
  }
  return out;
}
var sha = async (file) => (await hashFile(file).catch(() => null))?.sha256 ?? null;
async function loadBrandPack(env, scriptPath = process.argv[1]) {
  const explicit = envValue(env, "DARKMIND_BRAND_PACK");
  const dir = explicit ? path7.resolve(explicit) : await detectSkill(scriptPath).then((skill) => skill ? path7.join(skill.folder, "brand") : null);
  if (!dir) return null;
  const brand = await readJsonFile(path7.join(dir, "brand.json")).catch(() => null);
  if (brand?.kind !== "darkmind-brand-pack") return null;
  const manifest = await readJsonFile(path7.join(dir, "package.json")).catch(() => null);
  const files = /* @__PURE__ */ new Map();
  for (const rel3 of ["brand.json", ...(await walk(path7.join(dir, "lib"))).map((f) => `lib/${f}`), ...(await walk(path7.join(dir, "blocks"))).map((f) => `blocks/${f}`)]) {
    const hash = await sha(path7.join(dir, ...rel3.split("/")));
    if (hash) files.set(rel3, hash);
  }
  const assetDirs = [];
  for (const candidate of [envValue(env, "DARKMIND_BRAND_ASSETS"), brandAssetsHome({ ...env, DARKMIND_BRAND_ASSETS: "" }), path7.join(dir, "assets")]) {
    if (candidate && (await fs6.stat(candidate).catch(() => null))?.isDirectory()) assetDirs.push(path7.resolve(candidate));
  }
  return {
    dir,
    version: typeof brand.version === "string" ? brand.version : null,
    playwright: manifest?.dependencies?.["playwright-core"] ?? null,
    files,
    packageJson: await sha(path7.join(dir, "package.json")),
    packageLock: await sha(path7.join(dir, "package-lock.json")),
    assetDirs,
    assetHashes: /* @__PURE__ */ new Map()
  };
}
async function isBrandAsset(pack, file, hash) {
  const size = (await fs6.stat(file).catch(() => null))?.size;
  if (size === void 0) return false;
  if (!pack.assetIndex) {
    pack.assetIndex = /* @__PURE__ */ new Map();
    for (const dir of pack.assetDirs) {
      for (const rel3 of await walk(dir)) {
        const absolute = path7.join(dir, ...rel3.split("/"));
        const stat = await fs6.stat(absolute).catch(() => null);
        if (stat) pack.assetIndex.set(stat.size, [...pack.assetIndex.get(stat.size) ?? [], absolute]);
      }
    }
  }
  for (const candidate of pack.assetIndex.get(size) ?? []) {
    let candidateHash = pack.assetHashes.get(candidate);
    if (candidateHash === void 0) {
      candidateHash = await sha(candidate) ?? "";
      pack.assetHashes.set(candidate, candidateHash);
    }
    if (candidateHash === hash) return true;
  }
  return false;
}
function brandBlockOfCommand(extension) {
  const { program, args } = extension.command;
  if (program !== "node" || args.length !== 2 || args[0] !== RUNNER) return null;
  return ENTRY.exec(args[1])?.[1] ?? null;
}
async function brandBlockTrust(pack, root, extension, execution) {
  const block2 = brandBlockOfCommand(extension);
  if (!block2) return { trusted: false, block: null, reason: null };
  const no = (reason) => ({ trusted: false, block: block2, reason });
  if (!pack) return no("the script does not run from an editing skill with a brand pack, so the brand block cannot be compared");
  const label2 = `brand pack ${pack.version ?? "?"} of the installed skill`;
  for (const arg of extension.command.args) if (!execution.code[arg]) return no(`${arg} is not a declared input of the extension`);
  for (const tool of execution.tools) {
    if (!ALLOWED_TOOLS.has(tool.name)) return no(`tool "${tool.name}" is not a brand pack tool`);
    if (tool.name === "npm:playwright-core" && tool.required !== pack.playwright) return no(`playwright-core ${tool.required ?? "?"} is not the version of the ${label2} (${pack.playwright ?? "?"})`);
  }
  for (const [file, hash] of Object.entries(execution.code)) {
    if (!hash) return no(`${file} is missing`);
    if (file === "extensions/package.json") {
      if (hash !== pack.packageJson) return no(`${file} differs from the ${label2}`);
      continue;
    }
    if (!file.startsWith(`${BRAND_VENDOR}/`)) return no(`${file} is not part of the brand pack`);
    const rel3 = file.slice(BRAND_VENDOR.length + 1);
    if (rel3.startsWith("assets/")) {
      if (!await isBrandAsset(pack, path7.join(root, ...file.split("/")), hash)) return no(`${file} is not one of the installed brand assets`);
      continue;
    }
    const expected = pack.files.get(rel3);
    if (!expected) return no(`${file} is not part of the ${label2}`);
    if (expected !== hash) return no(`${file} differs from the ${label2} (vendor the block again with add-block --force)`);
  }
  return { trusted: true, block: block2, reason: null };
}
async function npmCli(env) {
  const nodeDir = path7.dirname(process.execPath);
  const execPath = envValue(env, "npm_execpath");
  const candidates = [
    ...execPath && /npm-cli\.js$/i.test(execPath) ? [execPath] : [],
    path7.join(nodeDir, "node_modules", "npm", "bin", "npm-cli.js"),
    path7.join(nodeDir, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js")
  ];
  for (const candidate of candidates) if ((await fs6.stat(candidate).catch(() => null))?.isFile()) return candidate;
  return null;
}
async function ensureBrandPackModules(root, pack, env, progress = () => {
}) {
  const dir = path7.join(root, "extensions");
  if (!pack?.packageJson || !pack.packageLock) return { status: "not-brand-pack" };
  if (await sha(path7.join(dir, "package.json")) !== pack.packageJson || await sha(path7.join(dir, "package-lock.json")) !== pack.packageLock) return { status: "not-brand-pack" };
  if ((await fs6.stat(path7.join(dir, "node_modules", "playwright-core", "package.json")).catch(() => null))?.isFile()) return { status: "present" };
  const cli = await npmCli(env);
  const windows = process.platform === "win32";
  const [program, args, shell] = cli ? [process.execPath, [cli, "ci", "--ignore-scripts", "--no-audit", "--no-fund"], false] : ["npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], windows];
  progress("extensions/: installing playwright-core of the brand pack (npm ci --ignore-scripts)");
  const result = await new Promise((resolve) => {
    const child = spawn2(program, args, { cwd: dir, env, shell, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    const keep = (chunk) => output = (output + chunk.toString("utf8")).slice(-4e3);
    child.stdout.on("data", keep);
    child.stderr.on("data", keep);
    const timer = setTimeout(() => child.kill(), NPM_TIMEOUT_MS);
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ code: null, output: error.message });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, output });
    });
  });
  if (result.code === 0) return { status: "installed" };
  const reason = result.output.trim().split(/\r?\n/).slice(-3).join(" | ") || "no output";
  return { status: "failed", message: `npm ci in extensions/ failed (${reason}); check the network or run "npm ci" in extensions/ yourself` };
}
async function findEdge(env, platform = process.platform) {
  const explicit = envValue(env, "DARKMIND_TOOL_MSEDGE");
  const candidates = explicit ? [explicit] : platform === "win32" ? [envValue(env, "ProgramFiles(x86)"), envValue(env, "ProgramFiles"), envValue(env, "LOCALAPPDATA")].filter((d) => Boolean(d)).map((d) => path7.join(d, "Microsoft", "Edge", "Application", "msedge.exe")) : platform === "darwin" ? ["/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"] : ["/usr/bin/microsoft-edge", "/usr/bin/microsoft-edge-stable", "/opt/microsoft/msedge/msedge"];
  for (const candidate of candidates) if ((await fs6.stat(candidate).catch(() => null))?.isFile()) return candidate;
  return null;
}

// src/commands/doctor.ts
var SKILL_ZIP_NAME = "darkmind-editing-skill.zip";
async function doctorCommand(ctx, tools = defaultTools(ctx.env), scriptPath = process.argv[1]) {
  const problems = [];
  const nodeOk = nodeMajor() >= MIN_NODE_MAJOR;
  if (!nodeOk) problems.push(`Node ${process.versions.node} is too old (need >= ${MIN_NODE_MAJOR}).`);
  const [ffmpeg2, ffprobe] = await Promise.all([toolVersion(tools, "ffmpeg"), toolVersion(tools, "ffprobe")]);
  if (!ffmpeg2 || !ffprobe) problems.push("ffmpeg/ffprobe not found (needed for proxies): install ffmpeg or set DARKMIND_FFMPEG/DARKMIND_FFPROBE.");
  let project = null;
  let config = null;
  try {
    config = await readConfig(ctx.root);
    project = config ? { projectId: config.projectId, baseVersion: config.baseVersion, videoRefs: config.videoRefs.length } : null;
  } catch (error) {
    problems.push(errorMessage(error));
  }
  let server = null;
  let reachable = null;
  let serverAgentVersion = null;
  try {
    server = resolveServer(ctx.server, config, ctx.env);
    try {
      const response = await httpRequest(`${server}/health`, { timeoutMs: 15e3 });
      await readBody(response);
      reachable = response.statusCode === 200;
      if (!reachable) problems.push(`${server}/health answered HTTP ${response.statusCode}.`);
    } catch (error) {
      reachable = false;
      problems.push(`Cannot reach ${server}: ${errorMessage(error)}`);
    }
    if (reachable) serverAgentVersion = await fetchServerAgentVersion(server);
  } catch (error) {
    problems.push(errorMessage(error));
  }
  const skill = await detectSkill(scriptPath);
  const notes = [];
  let brandAssets = null;
  let edge = null;
  if (skill && await fs7.stat(path8.join(skill.folder, "brand", "brand.json")).catch(() => null)) {
    const assets = await migrateBrandAssets(ctx.env, scriptPath).catch(() => ({ dir: brandAssetsHome(ctx.env), marker: null, migratedFrom: void 0 }));
    brandAssets = { dir: assets.dir, installed: Boolean(assets.marker), sha256: assets.marker?.sha256 ?? null, ...assets.migratedFrom ? { migratedFrom: assets.migratedFrom } : {} };
    if (assets.migratedFrom) notes.push(`Brand assets moved from ${assets.migratedFrom} to ${assets.dir} (they now survive plugin updates).`);
    if (!assets.marker) notes.push('Brand assets (Neuborn, logos, audio) are not installed; for brand projects call the MCP tool get_brand_assets and run "darkmind-agent brand-assets <ticket>".');
    edge = await findEdge(ctx.env);
    if (!edge) notes.push("Microsoft Edge was not found: the picture blocks of the brand pack render with headless Edge \u2013 install Edge or set DARKMIND_TOOL_MSEDGE to msedge(.exe).");
  }
  const cacheDir2 = mediaCacheDir(ctx.env);
  let mediaCache = { dir: null, reason: cacheDir2.reason };
  if (cacheDir2.dir) {
    const items = (await new MediaCache(cacheDir2.dir).list().catch(() => [])).filter((item) => !item.partial);
    mediaCache = { dir: cacheDir2.dir, entries: items.length, bytes: items.reduce((sum, item) => sum + item.size, 0) };
  }
  const updateAvailable = serverAgentVersion !== null && serverAgentVersion !== AGENT_VERSION;
  notes.push(...await extensionOutputNotes(ctx.root));
  if (updateAvailable) {
    notes.push(
      skill?.install === "plugin" ? `Dark Mind serves darkmind-agent ${serverAgentVersion}: the user updates the Dark Mind plugin with: node "${path8.join(skill.folder, "darkmind-agent.mjs")}" plugin update (then a new session).` : skill ? `Dark Mind serves darkmind-agent ${serverAgentVersion}: update the editing skill (download ${server}/downloads/${SKILL_ZIP_NAME} and replace the skill folder ${skill.folder}) \u2013 or switch to the Dark Mind plugin (${server}/downloads/darkmind-plugin.md).` : `Dark Mind serves darkmind-agent ${serverAgentVersion}: download ${server}/downloads/darkmind-agent.mjs again.`
    );
  }
  return {
    data: {
      version: AGENT_VERSION,
      node: process.versions.node,
      ffmpeg: ffmpeg2,
      ffprobe,
      project,
      server,
      serverReachable: reachable,
      serverAgentVersion,
      updateAvailable,
      skill: skill ? { name: skill.name, version: skill.version, folder: skill.folder, install: skill.install } : null,
      brandAssets,
      ...brandAssets ? { edge } : {},
      mediaCache,
      problems,
      notes
    },
    text: [
      `darkmind-agent ${AGENT_VERSION}, Node ${process.versions.node}`,
      `skill: ${skill ? `${skill.name} ${skill.version} (${skill.install === "plugin" ? "Dark Mind plugin, " : ""}${skill.folder})` : "not running from the editing skill folder"}`,
      ...brandAssets ? [`brand assets: ${brandAssets.installed ? `installed (${brandAssets.dir})` : "not installed (get_brand_assets \u2192 darkmind-agent brand-assets <ticket>)"}`, `Microsoft Edge (brand picture blocks): ${edge ?? "not found"}`] : [],
      `ffmpeg: ${ffmpeg2 ?? "missing"}`,
      `ffprobe: ${ffprobe ?? "missing"}`,
      `media cache: ${mediaCache.dir ? `${mediaCache.dir} (${mediaCache.entries} file(s), ${formatBytes(mediaCache.bytes ?? 0)}; "darkmind-agent cache" for details)` : `off (${mediaCache.reason})`}`,
      `project: ${project ? `${project.projectId} (base version ${project.baseVersion})` : "none in this folder"}`,
      `server: ${server ?? "unknown"}${reachable === null ? "" : reachable ? " (reachable)" : " (not reachable)"}${serverAgentVersion ? `, serves darkmind-agent ${serverAgentVersion}` : ""}`,
      ...problems.map((problem) => `problem: ${problem}`),
      ...notes.map((note) => `note: ${note}`)
    ].join("\n"),
    exitCode: problems.length > 0 ? 1 : 0
  };
}
async function extensionOutputNotes(root) {
  const project = await readJsonFile(path8.join(root, "project.json")).catch(() => null);
  const files = Array.isArray(project?.extensions) ? project.extensions.filter((file) => typeof file === "string") : [];
  const missing = [];
  for (const file of files) {
    const extension = await readJsonFile(path8.join(root, ...file.split("/"))).catch(() => null);
    if (!extension?.output?.path || extension.output.image) continue;
    if (!await fs7.stat(path8.join(root, ...extension.output.path.split("/"))).catch(() => null)) missing.push(extension.id ?? file);
  }
  const notes = [];
  const npmMissing = await fs7.stat(path8.join(root, "extensions", "package.json")).catch(() => null) && !await fs7.stat(path8.join(root, "extensions", "node_modules")).catch(() => null);
  if (npmMissing) notes.push(`extensions/node_modules is missing (a pull does not bring it): "darkmind-agent extensions run" installs playwright-core by itself when extensions/package.json and package-lock.json are those of the brand pack; other packages need "npm ci" in extensions/ \u2013 the user's step.`);
  if (missing.length) {
    notes.push(
      `${missing.length} extension output(s) are not rendered in this folder (${missing.join(", ")}); before "darkmind-agent preview" or a render run "darkmind-agent extensions run" \u2013 unchanged brand blocks need no approval; other extensions: "darkmind-agent extensions show <id>" \u2192 the user agrees \u2192 "extensions approve".`
    );
  }
  return notes;
}
async function fetchServerAgentVersion(server) {
  try {
    const response = await httpRequest(`${server}/downloads/darkmind-agent.mjs`, { method: "HEAD", timeoutMs: 15e3 });
    await readBody(response);
    const header = response.headers["x-darkmind-agent-version"];
    return response.statusCode === 200 && typeof header === "string" && header ? header : null;
  } catch {
    return null;
  }
}

// src/commands/download.ts
import { promises as fs15 } from "node:fs";
import path14 from "node:path";

// src/blob.ts
import { createHash as createHash3 } from "node:crypto";
import { createReadStream as createReadStream2, createWriteStream, promises as fs8 } from "node:fs";
import { pipeline } from "node:stream/promises";
var BLOCK_API_VERSION = "2026-04-06";
var DEFAULT_PUT_BLOB_MAX_BYTES = 256 * 1024 * 1024;
var DEFAULT_BLOCK_BYTES = 32 * 1024 * 1024;
function withQuery(url, query) {
  return `${url}${url.includes("?") ? "&" : "?"}${query}`;
}
function fileChanged(path34) {
  return new CliError("file-changed", `${path34} changed since "darkmind-agent manifest"; run manifest and project_push_begin again.`);
}
function isAlreadyThere(error) {
  return error instanceof HttpError && (error.status === 409 || error.status === 403 && error.code === "AuthorizationPermissionMismatch");
}
async function expectCreated(response, context) {
  if (response.statusCode === 201) {
    await readBody(response);
    return;
  }
  throw await toHttpError(response, context);
}
async function uploadObject(url, file, options = {}) {
  const putBlobMax = options.putBlobMaxBytes ?? DEFAULT_PUT_BLOB_MAX_BYTES;
  try {
    if (file.size <= putBlobMax) await putBlob(url, file);
    else await putBlocks(url, file, options.blockBytes ?? DEFAULT_BLOCK_BYTES);
    return "uploaded";
  } catch (error) {
    if (error instanceof HttpError && error.status === 400 && error.code === "Md5Mismatch") throw fileChanged(file.path);
    if (isAlreadyThere(error)) return "rejected";
    throw error;
  }
}
async function putBlob(url, file) {
  const hash = await hashFile(file.absolutePath, { md5: true });
  if (hash.sha256 !== file.sha256 || hash.size !== file.size) throw fileChanged(file.path);
  await withRetry(async () => {
    const response = await httpRequest(url, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": "application/octet-stream",
        "Content-Length": file.size,
        "Content-MD5": hash.md5
      },
      body: () => createReadStream2(file.absolutePath),
      timeoutMs: 3e5
    });
    await expectCreated(response, `Upload of ${file.path}`);
  });
}
async function putBlocks(url, file, blockBytes) {
  const ids = [];
  const sha2 = createHash3("sha256");
  const handle = await fs8.open(file.absolutePath, "r");
  try {
    for (let offset = 0, index = 0; offset < file.size; offset += blockBytes, index++) {
      const length2 = Math.min(blockBytes, file.size - offset);
      const buffer = Buffer.alloc(length2);
      const { bytesRead } = await handle.read(buffer, 0, length2, offset);
      if (bytesRead !== length2) throw fileChanged(file.path);
      sha2.update(buffer);
      const id2 = Buffer.from(`darkmind-${String(index).padStart(6, "0")}`).toString("base64");
      ids.push(id2);
      const md5 = createHash3("md5").update(buffer).digest("base64");
      await withRetry(async () => {
        const response = await httpRequest(withQuery(url, `comp=block&blockid=${encodeURIComponent(id2)}`), {
          method: "PUT",
          headers: { "x-ms-version": BLOCK_API_VERSION, "Content-Length": length2, "Content-MD5": md5 },
          body: buffer,
          timeoutMs: 3e5
        });
        await expectCreated(response, `Upload of ${file.path} (block ${index + 1})`);
      });
    }
    const extra = Buffer.alloc(1);
    if ((await handle.read(extra, 0, 1, file.size)).bytesRead !== 0) throw fileChanged(file.path);
  } finally {
    await handle.close();
  }
  if (sha2.digest("hex") !== file.sha256) throw fileChanged(file.path);
  const body = `<?xml version="1.0" encoding="utf-8"?><BlockList>${ids.map((id2) => `<Latest>${id2}</Latest>`).join("")}</BlockList>`;
  await withRetry(async () => {
    const response = await httpRequest(withQuery(url, "comp=blocklist"), {
      method: "PUT",
      headers: {
        "x-ms-version": BLOCK_API_VERSION,
        "Content-Type": "application/xml",
        "Content-Length": Buffer.byteLength(body),
        "x-ms-blob-content-type": "application/octet-stream"
      },
      body
    });
    await expectCreated(response, `Upload of ${file.path} (block list)`);
  });
}
var DEFAULT_DOWNLOAD_STREAMS = 4;
var DEFAULT_CHUNK_BYTES = 16 * 1024 * 1024;
function incomplete(message) {
  const error = new Error(message);
  error.code = "ECONNRESET";
  return error;
}
var retryDownload = (error) => isRetryable(error) || error?.code === "ERR_STREAM_PREMATURE_CLOSE";
async function verifyPart(part, expected) {
  const size = (await fs8.stat(part)).size;
  if (size !== expected.size) {
    await fs8.rm(part, { force: true });
    throw new CliError("size-mismatch", `${expected.label}: expected ${expected.size} bytes, got ${size}`);
  }
  if (expected.sha256) {
    const { sha256: sha2563 } = await hashFile(part);
    if (sha2563 !== expected.sha256) {
      await fs8.rm(part, { force: true });
      throw new CliError("hash-mismatch", `${expected.label}: content does not match its SHA-256`);
    }
  }
}
async function downloadFile(url, target, expected, options = {}) {
  const streams = Math.max(1, options.streams ?? DEFAULT_DOWNLOAD_STREAMS);
  const chunkBytes = Math.max(64 * 1024, options.chunkBytes ?? DEFAULT_CHUNK_BYTES);
  if (streams > 1 && expected.size >= 2 * chunkBytes) {
    try {
      return await downloadChunks(url, target, expected, { ...options, streams, chunkBytes });
    } catch (error) {
      if (!(error instanceof CliError && error.code === "range-unsupported")) throw error;
      await fs8.rm(`${target}.part`, { force: true });
      await fs8.rm(`${target}.part.json`, { force: true });
    }
  }
  return downloadSequential(url, target, expected, options);
}
async function downloadSequential(url, target, expected, options) {
  const part = `${target}.part`;
  if (await fs8.stat(`${part}.json`).catch(() => null)) {
    await fs8.rm(part, { force: true });
    await fs8.rm(`${part}.json`, { force: true });
  }
  let resumedBytes = -1;
  await withRetry(
    async () => {
      let offset = 0;
      try {
        offset = (await fs8.stat(part)).size;
      } catch {
        offset = 0;
      }
      if (offset > expected.size) {
        await fs8.rm(part, { force: true });
        offset = 0;
      }
      if (resumedBytes < 0) resumedBytes = offset;
      if (offset < expected.size || expected.size === 0) {
        const response = await httpRequest(url, {
          headers: offset > 0 ? { Range: `bytes=${offset}-` } : {},
          timeoutMs: 12e4
        });
        const status2 = response.statusCode ?? 0;
        if (status2 !== 200 && status2 !== 206) throw await toHttpError(response, `Download of ${expected.label}`);
        const append = offset > 0 && status2 === 206;
        await pipeline(response, createWriteStream(part, { flags: append ? "a" : "w" }));
        const size = (await fs8.stat(part)).size;
        if (size < expected.size) throw incomplete(`Download of ${expected.label} stopped at ${size} of ${expected.size} bytes`);
      }
      await verifyPart(part, expected);
    },
    { attempts: options.attempts ?? 6, retryIf: retryDownload }
  );
  await renameWithRetry(part, target);
  return { bytes: expected.size, resumedBytes: Math.max(0, resumedBytes), streams: 1 };
}
async function downloadChunks(url, target, expected, options) {
  const part = `${target}.part`;
  const mapFile = `${part}.json`;
  const { size } = expected;
  const { chunkBytes } = options;
  const count2 = Math.ceil(size / chunkBytes);
  const chunkLength = (index) => Math.min(size, (index + 1) * chunkBytes) - index * chunkBytes;
  const partStat = await fs8.stat(part).catch(() => null);
  const map = await readJsonFile(mapFile).catch(() => null);
  const done = /* @__PURE__ */ new Set();
  if (partStat && map) {
    if (map.version === 1 && map.size === size && map.chunkBytes === chunkBytes) map.done.filter((i) => Number.isInteger(i) && i >= 0 && i < count2).forEach((i) => done.add(i));
  } else if (partStat && partStat.size <= size) {
    for (let i = 0; (i + 1) * chunkBytes <= partStat.size || i === count2 - 1 && partStat.size === size; i++) done.add(i);
  }
  if (partStat && done.size === 0) await fs8.rm(part, { force: true });
  const resumedBytes = [...done].reduce((sum, i) => sum + chunkLength(i), 0);
  let saving = Promise.resolve();
  const save = () => {
    const snapshot2 = { version: 1, size, chunkBytes, done: [...done].sort((a, b) => a - b) };
    saving = saving.then(() => writeJsonFile(mapFile, snapshot2));
    return saving;
  };
  const handle = await fs8.open(part, done.size > 0 ? "r+" : "w+");
  try {
    await handle.truncate(size);
    await save();
    const todo = Array.from({ length: count2 }, (_, i) => i).filter((i) => !done.has(i));
    let failure = null;
    await runPool(todo, options.streams, async (index) => {
      if (failure) return;
      const start = index * chunkBytes;
      const end = start + chunkLength(index) - 1;
      try {
        await withRetry(
          async () => {
            const response = await httpRequest(url, { headers: { Range: `bytes=${start}-${end}` }, timeoutMs: 12e4 });
            const status2 = response.statusCode ?? 0;
            if (status2 === 200) {
              response.destroy();
              throw new CliError("range-unsupported", `${expected.label}: the server ignores Range requests`);
            }
            if (status2 !== 206) throw await toHttpError(response, `Download of ${expected.label}`);
            let position = start;
            for await (const chunk of response) {
              const buffer = chunk;
              if (position + buffer.length > end + 1) throw incomplete(`Download of ${expected.label}: chunk ${index + 1} is longer than requested`);
              await handle.write(buffer, 0, buffer.length, position);
              position += buffer.length;
            }
            if (position !== end + 1) throw incomplete(`Download of ${expected.label}: chunk ${index + 1} stopped at ${position - start} of ${end - start + 1} bytes`);
          },
          { attempts: options.attempts ?? 6, retryIf: retryDownload }
        );
      } catch (error) {
        failure ??= error;
        return;
      }
      done.add(index);
      await save();
    });
    await saving;
    if (failure) throw failure;
  } finally {
    await handle.close();
  }
  await verifyPart(part, expected);
  await fs8.rm(mapFile, { force: true });
  await renameWithRetry(part, target);
  return { bytes: size, resumedBytes, streams: options.streams };
}

// src/commands/project.ts
import { promises as fs14 } from "node:fs";
import path13 from "node:path";

// src/ignore.ts
import { promises as fs9 } from "node:fs";
import path9 from "node:path";
var DEFAULT_IGNORE_TEXT = `# darkmind-agent: files and folders that are never pushed to Dark Mind (gitignore syntax).
# Pushed are text artefacts and AI media that cannot be reproduced; renderings, proxies and originals are not.

# Renderings and Dark Mind media (reproducible: render again, or "darkmind-agent media <ticket>")
renders/
media/proxy/
media/original/

# Tools
node_modules/
.git/
.venv/
__pycache__/

# Temporary files
*.tmp
*.temp
*.part
*.crdownload
*.swp
*~
~$*
.DS_Store
Thumbs.db
desktop.ini
`;
var ALWAYS_EXCLUDED_TEXT = `/${STATE_DIR}/
/${CONFIG_FILE}
`;
function escapeRegex(char) {
  return /[.+^${}()|\\]/.test(char) ? `\\${char}` : char;
}
function globToRegex(glob) {
  let out = "";
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i];
    if (char === "*") {
      if (glob[i + 1] === "*") {
        const atStart = i === 0;
        const followedBySlash = glob[i + 2] === "/";
        const precededBySlash = i > 0 && glob[i - 1] === "/";
        if ((atStart || precededBySlash) && followedBySlash) {
          out += "(?:.*/)?";
          i += 2;
          continue;
        }
        if (precededBySlash && i + 2 === glob.length) {
          out += ".*";
          i += 1;
          continue;
        }
        out += ".*";
        i += 1;
        continue;
      }
      out += "[^/]*";
    } else if (char === "?") {
      out += "[^/]";
    } else if (char === "[") {
      const end = glob.indexOf("]", i + 2);
      if (end === -1) {
        out += "\\[";
      } else {
        let body = glob.slice(i + 1, end).replace(/\\/g, "\\\\");
        if (body.startsWith("!")) body = `^${body.slice(1)}`;
        out += `[${body}]`;
        i = end;
      }
    } else if (char === "\\" && i + 1 < glob.length) {
      out += escapeRegex(glob[i + 1]);
      i++;
    } else {
      out += escapeRegex(char);
    }
  }
  return out;
}
function parseIgnoreRules(text3) {
  const rules = [];
  for (const rawLine of text3.split(/\r?\n/)) {
    let line = rawLine.replace(/(?<!\\)\s+$/, "");
    if (!line || line.startsWith("#")) continue;
    let negate = false;
    if (line.startsWith("!")) {
      negate = true;
      line = line.slice(1);
    } else if (line.startsWith("\\!") || line.startsWith("\\#")) {
      line = line.slice(1);
    }
    let dirOnly = false;
    if (line.endsWith("/")) {
      dirOnly = true;
      line = line.replace(/\/+$/, "");
    }
    if (!line) continue;
    const anchored = line.includes("/");
    line = line.replace(/^\/+/, "");
    const body = globToRegex(line);
    rules.push({
      source: rawLine.trim(),
      negate,
      dirOnly,
      regex: new RegExp(anchored ? `^${body}$` : `^(?:.*/)?${body}$`, "i")
    });
  }
  return rules;
}
function createIgnoreMatcher(text3) {
  const always = parseIgnoreRules(ALWAYS_EXCLUDED_TEXT);
  const rules = parseIgnoreRules(text3);
  return {
    rules: [...always, ...rules].map((rule) => rule.source),
    ignores(relativePath, isDirectory) {
      if (always.some((rule) => (!rule.dirOnly || isDirectory) && rule.regex.test(relativePath))) return true;
      let ignored = false;
      for (const rule of rules) {
        if (rule.dirOnly && !isDirectory) continue;
        if (rule.regex.test(relativePath)) ignored = !rule.negate;
      }
      return ignored;
    }
  };
}
async function loadIgnoreMatcher(root) {
  try {
    const text3 = await fs9.readFile(path9.join(root, IGNORE_FILE), "utf8");
    return { matcher: createIgnoreMatcher(text3), source: "file" };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { matcher: createIgnoreMatcher(DEFAULT_IGNORE_TEXT), source: "default" };
  }
}

// src/local-state.ts
import { promises as fs11 } from "node:fs";
import path10 from "node:path";

// src/classify.ts
import { promises as fs10 } from "node:fs";
var TEXT_EXTENSIONS = new Set(
  "txt md markdown rst adoc tex json jsonc json5 ndjson jsonl yaml yml toml ini cfg conf env properties csv tsv xml html htm xhtml css scss sass less svg js mjs cjs ts mts cts tsx jsx vue py ipynb rb go rs java kt cs fs swift lua r sql sh bash zsh ps1 psm1 psd1 bat cmd srt vtt ass ssa sub sbv lrc edl fcpxml xmeml otio xmp cube log gitignore gitattributes darkmindignore editorconfig".split(/\s+/)
);
var AUDIO_EXTENSIONS = new Set("wav wave mp3 aac m4a flac ogg oga opus aif aiff aifc wma caf".split(" "));
var IMAGE_EXTENSIONS = new Set("png jpg jpeg gif webp bmp tif tiff heic heif avif psd exr dpx tga ico jxl".split(" "));
var VIDEO_EXTENSIONS = new Set("mp4 mov m4v mkv webm avi mxf mts m2ts mpg mpeg wmv flv 3gp ogv".split(" "));
function extensionOf(relativePath) {
  const name = relativePath.slice(relativePath.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return dot <= 0 && !name.startsWith(".") ? "" : name.slice(dot + 1).toLowerCase();
}
function kindByExtension(relativePath) {
  const ext = extensionOf(relativePath);
  if (!ext) return null;
  if (TEXT_EXTENSIONS.has(ext)) return "text";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  return null;
}
function looksLikeText(sample) {
  if (sample.includes(0)) return false;
  let end = sample.length;
  for (let back = 1; back <= 3 && end - back >= 0; back++) {
    const byte = sample[end - back];
    if ((byte & 192) === 192) {
      end -= back;
      break;
    }
    if ((byte & 128) === 0) break;
  }
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(sample.subarray(0, end));
    return true;
  } catch {
    return false;
  }
}
async function readSample(absolutePath, bytes = 8192) {
  const handle = await fs10.open(absolutePath, "r");
  try {
    const buffer = Buffer.alloc(bytes);
    const { bytesRead } = await handle.read(buffer, 0, bytes, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}
async function classifyFile(relativePath, absolutePath) {
  const kind = kindByExtension(relativePath) ?? (looksLikeText(await readSample(absolutePath)) ? "text" : "binary");
  return { class: kind === "text" ? "text" : "generated-media", kind };
}

// src/local-state.ts
async function scanFolder(root, matcher) {
  const files = [];
  const skipped = [];
  async function walk2(directory, prefix) {
    const entries = await fs11.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const relative = `${prefix}${entry.name.normalize("NFC")}`;
      const absolutePath = path10.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!matcher.ignores(relative, true)) await walk2(absolutePath, `${relative}/`);
      } else if (entry.isFile()) {
        if (matcher.ignores(relative, false)) continue;
        const stat = await fs11.stat(absolutePath);
        files.push({ path: relative, absolutePath, size: stat.size, mtimeMs: stat.mtimeMs });
      } else if (!matcher.ignores(relative, false)) {
        skipped.push({ path: relative, reason: entry.isSymbolicLink() ? "symbolic link (not followed)" : "not a regular file" });
      }
    }
  }
  await walk2(root, "");
  files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  return { files, skipped };
}
var DEFAULT_WARN_FILE_MB = 100;
var DEFAULT_WARN_TOTAL_MB = 500;
async function readLocalState(root, config, options = {}) {
  const { matcher, source } = await loadIgnoreMatcher(root);
  const scan = await scanFolder(root, matcher);
  const warnings = scan.skipped.map((item) => `${item.path}: skipped, ${item.reason}`);
  const pathErrors = scan.files.map((file) => ({ path: file.path, error: getCutProjectPathError(file.path) })).filter((item) => item.error !== null);
  if (pathErrors.length > 0) {
    throw new CliError(
      "invalid-paths",
      `${pathErrors.length} file name(s) cannot be stored in Dark Mind (rename them or add them to .darkmindignore): ` + pathErrors.slice(0, 5).map((item) => `${item.path} (${item.error})`).join("; "),
      { files: pathErrors }
    );
  }
  const cache = await HashCache.load(statePaths(root).hashes);
  const kinds = /* @__PURE__ */ new Map();
  const entries = await runPool(scan.files, 4, async (file) => {
    const [sha2563, classification] = await Promise.all([
      cache.hash(file.path, file.absolutePath, file.size, file.mtimeMs),
      classifyFile(file.path, file.absolutePath)
    ]);
    kinds.set(file.path, classification.kind);
    return { path: file.path, sha256: sha2563, size: file.size, class: classification.class };
  });
  await cache.save({ prune: true });
  const warnFileBytes = (options.warnFileMb ?? DEFAULT_WARN_FILE_MB) * 1024 * 1024;
  const warnTotalBytes = (options.warnTotalMb ?? DEFAULT_WARN_TOTAL_MB) * 1024 * 1024;
  let generatedBytes = 0;
  for (const entry of entries) {
    if (entry.class !== "generated-media") continue;
    generatedBytes += entry.size;
    const kind = kinds.get(entry.path);
    if (kind === "video") {
      warnings.push(
        `${entry.path}: video file is pushed as generated media. Renderings, proxies and originals belong in renders/ or media/ (excluded); add other reproducible videos to .darkmindignore.`
      );
    } else if (kind === "binary") {
      warnings.push(`${entry.path}: unknown binary file type, pushed as generated media.`);
    }
    if (entry.size > warnFileBytes) {
      warnings.push(`${entry.path}: large generated media file (${formatBytes(entry.size)}); exclude it via .darkmindignore if it can be reproduced.`);
    }
  }
  if (generatedBytes > warnTotalBytes) {
    warnings.push(`Generated media total ${formatBytes(generatedBytes)}; consider excluding reproducible media (Dark Mind warns above its push limit, too).`);
  }
  const draft = {
    schemaVersion: CUT_PROJECT_MANIFEST_SCHEMA_VERSION,
    projectId: config.projectId,
    files: entries,
    videoRefs: config.videoRefs
  };
  const validation = validateCutProjectManifest(draft);
  if (!validation.success) {
    throw new CliError("invalid-manifest", `Manifest is invalid: ${validation.errors.slice(0, 5).join("; ")}`, { errors: validation.errors });
  }
  return {
    manifest: canonicalizeCutProjectManifest(validation.manifest),
    absolutePaths: new Map(scan.files.map((file) => [file.path, file.absolutePath])),
    kinds,
    warnings,
    ignoreSource: source
  };
}
function diffManifests(base, current) {
  const before = new Map((base?.files ?? []).map((file) => [file.path, file.sha256]));
  const after = new Map(current.files.map((file) => [file.path, file.sha256]));
  const diff = { added: [], modified: [], deleted: [], unchanged: 0, videoRefsAdded: [], videoRefsRemoved: [] };
  for (const [file, sha2] of after) {
    const previous = before.get(file);
    if (previous === void 0) diff.added.push(file);
    else if (previous !== sha2) diff.modified.push(file);
    else diff.unchanged++;
  }
  for (const file of before.keys()) if (!after.has(file)) diff.deleted.push(file);
  const refsBefore = new Set(base?.videoRefs ?? []);
  const refsAfter = new Set(current.videoRefs);
  diff.videoRefsAdded = [...refsAfter].filter((ref) => !refsBefore.has(ref));
  diff.videoRefsRemoved = [...refsBefore].filter((ref) => !refsAfter.has(ref));
  return diff;
}
function isEmptyDiff(diff) {
  return diff.added.length + diff.modified.length + diff.deleted.length + diff.videoRefsAdded.length + diff.videoRefsRemoved.length === 0;
}

// src/project-refs.ts
import { promises as fs13 } from "node:fs";
import path12 from "node:path";

// src/commands/pipeline.ts
import { promises as fs12 } from "node:fs";
import path11 from "node:path";
var PROFILE_ALIASES = {
  vertical: "vertical-1080x1920-30",
  "9x16": "vertical-1080x1920-30",
  "vertical-1080x1920-30": "vertical-1080x1920-30",
  landscape: "landscape-1920x1080-25",
  "16x9": "landscape-1920x1080-25",
  "landscape-1920x1080-25": "landscape-1920x1080-25"
};
function projectReader(root) {
  const resolve = (file) => path11.join(root, ...file.split("/"));
  return {
    async readText(file) {
      try {
        return await fs12.readFile(resolve(file), "utf8");
      } catch (error) {
        const code = error.code;
        if (code === "ENOENT" || code === "ENOTDIR" || code === "EISDIR") return null;
        throw error;
      }
    },
    async exists(file) {
      try {
        return (await fs12.stat(resolve(file))).isFile();
      } catch {
        return false;
      }
    },
    async list(folder) {
      const { matcher } = await loadIgnoreMatcher(root);
      const files = [];
      const walk2 = async (rel3) => {
        const entries = await fs12.readdir(resolve(rel3), { withFileTypes: true }).catch(() => []);
        for (const entry of entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
          const child = `${rel3}/${entry.name.normalize("NFC")}`;
          if (entry.isDirectory()) {
            if (!matcher.ignores(child, true)) await walk2(child);
          } else if (entry.isFile() && !matcher.ignores(child, false)) files.push(child);
        }
      };
      await walk2(folder);
      return files;
    }
  };
}
function summarize(result) {
  const state = !result.valid ? "INVALID" : result.ready ? "ready" : "valid draft, not ready";
  const length2 = result.totalFrames === null ? "no timeline" : `${result.totalFrames} frames (${(result.totalFrames / Number(result.fps)).toFixed(2)} s at ${result.fps} fps)`;
  return `${state}: ${result.counts.error} errors, ${result.counts.pending} pending, ${result.counts.warning} warnings; ${length2}; ${result.videoRefs.length} video references`;
}
function validationData(result) {
  const issues = capList(result.issues, 200);
  return {
    valid: result.valid,
    ready: result.ready,
    counts: result.counts,
    totalFrames: result.totalFrames,
    durationSeconds: result.durationSeconds,
    fps: result.fps,
    videoRefs: result.videoRefs,
    conform: result.conform,
    issues: issues.items,
    ...issues.truncated ? { issuesTruncated: issues.truncated } : {}
  };
}
async function validateCommand(ctx, options) {
  const result = await validateEditProject(projectReader(ctx.root));
  const failed = !result.valid || options.ready && !result.ready;
  const lines = result.issues.slice(0, 100).map((issue) => `  ${formatEditIssue(issue)}`);
  if (result.issues.length > 100) lines.push(`  \u2026 ${result.issues.length - 100} more (use --json)`);
  return {
    data: {
      ...validationData(result),
      next: !result.valid ? 'Fix the errors (file, field and clip are named in each issue) and run "darkmind-agent validate" again.' : !result.ready ? "Resolve the pending points (open draft items at the material, timeline, captions, media facts) before the editorial review." : "Ready for the editorial review and rendering."
    },
    text: [summarize(result), ...lines].join("\n"),
    exitCode: failed ? 1 : 0
  };
}
async function importCutlistCommand(ctx, options) {
  const from = (options.from ?? EDIT_DEFAULT_FILES.exploreCutlist).replace(/\\/g, "/");
  const pathError = getCutProjectPathError(from);
  if (pathError) throw new CliError("invalid-input", `--from must be a file inside the project folder (relative path): ${pathError}`);
  let profile;
  if (options.profile !== void 0) {
    profile = PROFILE_ALIASES[options.profile.toLowerCase()];
    if (!profile) throw new CliError("invalid-input", `--profile must be one of ${Object.keys(PROFILE_ALIASES).join(", ")}`);
  }
  const reader = projectReader(ctx.root);
  const content = await fs12.readFile(path11.join(ctx.root, ...from.split("/"))).catch((error) => {
    if (error.code === "ENOENT") throw new CliError("not-found", `${from} does not exist in ${ctx.root} (pull the Explore import project first)`);
    throw error;
  });
  let cutlist;
  try {
    cutlist = JSON.parse(content.toString("utf8").replace(/^\uFEFF/, ""));
  } catch (error) {
    throw new CliError("invalid-cutlist", `${from} is not valid JSON: ${errorMessage(error)}`);
  }
  const targets = [EDIT_DEFAULT_FILES.project, EDIT_DEFAULT_FILES.sources, EDIT_DEFAULT_FILES.edit, EDIT_DEFAULT_FILES.brief];
  if (targets.some((target) => target.toLowerCase() === from.toLowerCase())) throw new CliError("invalid-input", `--from must not be one of ${targets.join(", ")}`);
  const existing = [];
  for (const target of targets) if (await reader.readText(target) !== null) existing.push(target);
  if (existing.length && !options.force) {
    throw new CliError("already-exists", `${existing.join(", ")} already exist; the folder is already converted. Use --force to overwrite them (loses edits to these files).`, {
      existing
    });
  }
  let converted;
  try {
    converted = convertExploreCutlist(cutlist, {
      cutlistPath: from,
      cutlistSha256: sha256Hex(content),
      importedAt: (options.now?.() ?? /* @__PURE__ */ new Date()).toISOString(),
      ...profile ? { profile } : {},
      ...options.title ? { title: options.title } : {}
    });
  } catch (error) {
    if (error instanceof ExploreCutlistError) throw new CliError("invalid-cutlist", `${from}: ${error.message}`);
    throw error;
  }
  const json2 = (value2) => `${JSON.stringify(value2, null, 2)}
`;
  await writeFileAtomic(path11.join(ctx.root, EDIT_DEFAULT_FILES.project), json2(converted.files.project));
  await writeFileAtomic(path11.join(ctx.root, EDIT_DEFAULT_FILES.sources), json2(converted.files.sources));
  await writeFileAtomic(path11.join(ctx.root, EDIT_DEFAULT_FILES.edit), json2(converted.files.edit));
  await writeFileAtomic(path11.join(ctx.root, EDIT_DEFAULT_FILES.brief), converted.files.brief);
  const result = await validateEditProject(reader);
  const c = converted.counts;
  return {
    data: {
      written: targets,
      unchanged: from,
      counts: c,
      warnings: converted.warnings,
      validation: validationData(result),
      next: 'Resolve every statement at the material (source, exact range, verified quote, context; remove "unresolved" codes only after checking), then build timeline.json and captions.json and run "darkmind-agent validate".'
    },
    text: `Converted ${from} into ${targets.join(", ")} (${from} unchanged): ${c.statements} statements, ${c.broll} B-roll, ${c.scenes} scenes, ${c.sources} sources; ${c.approximate} approximate timecodes, ${c.missingSources} without a source.
${summarize(result)}` + converted.warnings.map((warning) => `
warning: ${warning}`).join(""),
    exitCode: result.valid ? 0 : 1
  };
}
function parseWordTimings(file, value2) {
  const list2 = Array.isArray(value2) ? value2 : [value2];
  return list2.map((entry, index) => {
    const where = list2.length > 1 ? `${file}[${index}]` : file;
    const item = entry;
    if (item?.error) throw new CliError("invalid-input", `${where} is an error result of get_word_timings, not word timings: ${JSON.stringify(item.error)}`);
    if (typeof item?.videoId !== "string" && typeof item?.sourceId !== "string") throw new CliError("invalid-input", `${where} needs "videoId" (Dark Mind video) or "sourceId"`);
    if (!Array.isArray(item.words)) throw new CliError("invalid-input", `${where} needs a "words" array ({ text, start, end } in seconds of the original)`);
    const words = item.words.map((word, n) => {
      if (typeof word?.text !== "string" || typeof word.start !== "number" || typeof word.end !== "number") {
        throw new CliError("invalid-input", `${where} words[${n}] needs text (string), start and end (seconds as numbers)`);
      }
      return { text: word.text, start: word.start, end: word.end };
    });
    return { ...typeof item.videoId === "string" ? { videoId: item.videoId } : {}, ...typeof item.sourceId === "string" ? { sourceId: item.sourceId } : {}, words };
  });
}
async function captionsWordsCommand(ctx, files, options) {
  if (!files.length) throw new CliError("usage", "captions-words needs at least one file with saved get_word_timings results");
  const timings = [];
  for (const file of files) {
    const absolute = path11.resolve(ctx.root, file);
    const content = await fs12.readFile(absolute, "utf8").catch((error) => {
      if (error.code === "ENOENT") throw new CliError("not-found", `${file} does not exist`);
      throw error;
    });
    let value2;
    try {
      value2 = JSON.parse(content.replace(/^\uFEFF/, ""));
    } catch (error) {
      throw new CliError("invalid-input", `${file} is not valid JSON: ${errorMessage(error)}`);
    }
    timings.push(...parseWordTimings(file, value2));
  }
  const reader = projectReader(ctx.root);
  const before = await validateEditProject(reader);
  const docs = before.documents;
  if (!docs?.captions) throw new CliError("not-ready", "captions.json is missing or invalid; write the captions first (darkmind-agent validate names the problems)");
  const unknown = (options.captions ?? []).filter((id2) => !docs.captions.captions.some((c) => c.id === id2));
  if (unknown.length) throw new CliError("invalid-input", `unknown caption IDs: ${unknown.join(", ")}`);
  const result = assignCaptionWords({ project: docs.project, sources: docs.sources, timeline: docs.timeline, captions: docs.captions }, timings, { captionIds: options.captions });
  const assigned = result.report.filter((r) => r.status === "assigned");
  const skipped = result.report.filter((r) => r.status === "skipped");
  const captionsFile = docs.project.artifacts.captions;
  const text3 = `${JSON.stringify(result.captions, null, 2)}
`;
  if (!options.print && assigned.length) await writeFileAtomic(path11.join(ctx.root, ...captionsFile.split("/")), text3);
  const after = options.print ? before : await validateEditProject(reader);
  const lines = [
    `${options.print ? "Would assign" : "Assigned"} word timings to ${assigned.length} captions (${assigned.reduce((a, r) => a + r.matched, 0)} words matched, ${assigned.reduce((a, r) => a + r.interpolated, 0)} interpolated); ${skipped.length} skipped`,
    ...skipped.map((r) => `  skipped ${r.id}: ${r.reason}`),
    ...assigned.filter((r) => r.interpolated > 0 || r.spread).map((r) => `  ${r.id}: ${r.interpolated} of ${r.tokens} words interpolated${r.spread ? ", spread by length (times did not fit)" : ""} \u2013 check at the material`),
    summarize(after)
  ];
  return {
    data: {
      file: captionsFile,
      written: !options.print && assigned.length > 0,
      report: result.report,
      ...options.print ? { captions: result.captions } : {},
      validation: validationData(after),
      next: "Word timings change the preview state (preview review); emphasis flags (words[].emphasis) belong to the caption text review."
    },
    text: options.print ? `${text3}
${lines.join("\n")}` : lines.join("\n"),
    exitCode: after.valid ? 0 : 1
  };
}

// src/project-refs.ts
var sortRefs = (refs) => [...new Set([...refs].map(normalizeCutProjectVideoId))].sort();
async function isFile(file) {
  return (await fs13.stat(file).catch(() => null))?.isFile() ?? false;
}
async function resolveVideoRefs(root, config) {
  const configured = sortRefs(config.videoRefs);
  if (!await isFile(path12.join(root, EDIT_DEFAULT_FILES.project))) {
    return { source: "darkmind.json", videoRefs: configured, added: [], dropped: [], pipeline: null, documents: null };
  }
  const result = await validateEditProject(projectReader(root));
  const pipeline3 = {
    valid: result.valid,
    ready: result.ready,
    counts: result.counts,
    errors: result.issues.filter((issue) => issue.severity === "error").slice(0, 10).map(formatEditIssue)
  };
  const derived = sortRefs(result.videoRefs);
  const videoRefs = result.valid ? derived : sortRefs([...derived, ...configured]);
  const configuredSet = new Set(configured);
  const finalSet = new Set(videoRefs);
  return {
    source: result.valid ? "pipeline" : "pipeline+darkmind.json",
    videoRefs,
    added: videoRefs.filter((ref) => !configuredSet.has(ref)),
    dropped: configured.filter((ref) => !finalSet.has(ref)),
    pipeline: pipeline3,
    documents: result.documents
  };
}
async function walkFiles(root, folder) {
  const files = [];
  const walk2 = async (rel3) => {
    const entries = await fs13.readdir(path12.join(root, ...rel3.split("/")), { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const child = `${rel3}/${entry.name.normalize("NFC")}`;
      if (entry.isDirectory()) await walk2(child);
      else if (entry.isFile()) files.push(child);
    }
  };
  await walk2(folder);
  return files;
}
async function requiredPipelineFiles(root, documents) {
  const candidates = /* @__PURE__ */ new Set([EDIT_DEFAULT_FILES.project]);
  if (documents) {
    for (const file of Object.values(documents.project.artifacts)) if (file) candidates.add(file);
    for (const file of documents.project.extensions) candidates.add(file);
    for (const source of documents.sources?.sources ?? []) if (source.kind === "asset") candidates.add(source.path);
    for (const extension of documents.extensions) {
      for (const input of extension.inputs) if (input.kind === "file") candidates.add(input.path);
    }
    if (documents.project.origin?.file) candidates.add(documents.project.origin.file);
    if (documents.project.recipe) candidates.add(EDIT_RECIPE_FILES.lock);
  }
  candidates.add(EDIT_RECIPE_FILES.draft);
  candidates.add(EDIT_RECIPE_FILES.material);
  for (const file of await walkFiles(root, EDIT_FOLDERS.reviews)) candidates.add(file);
  const existing = [];
  for (const file of candidates) if (await isFile(path12.join(root, ...file.split("/")))) existing.push(file);
  return existing.sort();
}
function missingFromManifest(required, manifest) {
  const present = new Set(manifest.files.map((file) => file.path.toLowerCase()));
  return required.filter((file) => !present.has(file.toLowerCase()));
}

// src/commands/project.ts
async function readManifestFile(file) {
  let text3;
  try {
    text3 = await fs14.readFile(file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
  let parsed;
  try {
    parsed = JSON.parse(text3);
  } catch {
    throw new CliError("invalid-manifest", `${file} is not valid JSON`);
  }
  const result = validateCutProjectManifest(parsed);
  if (!result.success) throw new CliError("invalid-manifest", `${file}: ${result.errors.slice(0, 3).join("; ")}`, { errors: result.errors });
  return result.manifest;
}
async function readBaseManifest(root, config) {
  if (config.baseVersion === 0) return null;
  const manifest = await readManifestFile(statePaths(root).baseManifest).catch(() => null);
  return manifest && manifest.projectId.toLowerCase() === config.projectId ? manifest : null;
}
async function initCommand(ctx, projectIdArg, options) {
  if (!projectIdArg) throw new CliError("invalid-input", "Usage: darkmind-agent init <projectId>");
  const projectId = normalizeProjectId(projectIdArg);
  await fs14.mkdir(ctx.root, { recursive: true });
  const existing = await readConfig(ctx.root);
  if (existing && existing.projectId !== projectId && !options.force) {
    throw new CliError(
      "already-initialized",
      `${CONFIG_FILE} belongs to project ${existing.projectId}. Use another folder, or --force to switch this folder to ${projectId}.`
    );
  }
  const serverCandidate = ctx.server || ctx.env.DARKMIND_URL || existing?.server || embeddedServer();
  const server = serverCandidate ? normalizeServer(serverCandidate) : void 0;
  const sameProject = existing?.projectId === projectId;
  const config = sameProject ? { ...existing, ...server ? { server } : {} } : { projectId, ...server ? { server } : {}, baseVersion: 0, videoRefs: [] };
  if (!sameProject) await fs14.rm(statePaths(ctx.root).state, { recursive: true, force: true });
  await writeConfig(ctx.root, config);
  const created = [CONFIG_FILE];
  const ignorePath = path13.join(ctx.root, IGNORE_FILE);
  if (!await exists(ignorePath)) {
    await writeFileAtomic(ignorePath, DEFAULT_IGNORE_TEXT);
    created.push(IGNORE_FILE);
  }
  const warnings = server ? [] : ["Dark Mind URL unknown: pass --server when redeeming tickets, or set DARKMIND_URL."];
  return {
    data: {
      projectId,
      server: server ?? null,
      baseVersion: config.baseVersion,
      written: created,
      warnings,
      next: config.baseVersion === 0 ? 'Create the project files here, then "darkmind-agent manifest".' : '"darkmind-agent status"'
    },
    text: `Initialized ${ctx.root} for project ${projectId} (base version ${config.baseVersion}); wrote ${created.join(", ")}.`
  };
}
function refsData(refs) {
  return {
    videoRefsSource: refs.source,
    ...refs.added.length ? { videoRefsDerived: refs.added } : {},
    ...refs.dropped.length ? { videoRefsDropped: refs.dropped } : {},
    ...refs.pipeline ? { pipeline: refs.pipeline } : {}
  };
}
function refsWarnings(refs) {
  const warnings = [];
  if (refs.source === "pipeline+darkmind.json") {
    warnings.push('The editing pipeline is invalid: video references are the derived ones plus all of darkmind.json (nothing dropped). Fix the errors ("darkmind-agent validate") before the next push.');
  }
  return warnings;
}
async function manifestCommand(ctx, options) {
  const stored = await requireConfig(ctx.root);
  const refs = await resolveVideoRefs(ctx.root, stored);
  if (refs.pipeline && !refs.pipeline.valid && !options.allowInvalid) {
    throw new CliError(
      "pipeline-invalid",
      `The editing pipeline has ${refs.pipeline.counts.error} error(s), so its video references and required files cannot be derived reliably. Fix them ("darkmind-agent validate"), or push a work-in-progress state with --allow-invalid (keeps every reference of darkmind.json).`,
      { pipeline: refs.pipeline }
    );
  }
  const config = { ...stored, videoRefs: refs.videoRefs };
  const state = await readLocalState(ctx.root, config, options);
  const warnings = [...refsWarnings(refs), ...state.warnings];
  if (refs.pipeline) {
    const excluded = missingFromManifest(await requiredPipelineFiles(ctx.root, refs.documents), state.manifest);
    if (excluded.length > 0 && !options.allowInvalid) {
      throw new CliError(
        "required-files-excluded",
        `${excluded.length} file(s) the editing pipeline needs are excluded from the push by ${IGNORE_FILE}: ${excluded.slice(0, 5).join(", ")}. Remove the matching rules from ${IGNORE_FILE} (renders/ and media/ never hold pipeline files), otherwise the archived version cannot be restored.`,
        { files: excluded }
      );
    }
    if (excluded.length > 0) warnings.push(`Excluded although the pipeline needs them (archive not restorable): ${excluded.join(", ")}`);
  }
  if (refs.source !== "darkmind.json" && refs.videoRefs.join() !== [...stored.videoRefs].sort().join()) {
    await writeConfig(ctx.root, config);
  }
  const serialized = serializeCutProjectManifest(state.manifest);
  const paths = statePaths(ctx.root);
  await writeFileAtomic(paths.manifest, serialized);
  const base = await readBaseManifest(ctx.root, config);
  const diff = diffManifests(base, state.manifest);
  const summary3 = summarizeCutProjectManifest(state.manifest);
  const changed = !isEmptyDiff(diff);
  const relative = path13.relative(ctx.root, paths.manifest).split(path13.sep).join("/");
  if (options.print) {
    return { data: JSON.parse(serialized), text: serialized.trimEnd() };
  }
  return {
    data: {
      manifestPath: relative,
      projectId: config.projectId,
      baseVersion: config.baseVersion,
      fileCount: summary3.fileCount,
      totalBytes: summary3.totalBytes,
      generatedMediaBytes: summary3.generatedMediaBytes,
      objectCount: summary3.objectCount,
      videoRefs: state.manifest.videoRefs.length,
      changes: {
        added: diff.added.length,
        modified: diff.modified.length,
        deleted: diff.deleted.length,
        videoRefsAdded: diff.videoRefsAdded.length,
        videoRefsRemoved: diff.videoRefsRemoved.length
      },
      changed,
      ...refsData(refs),
      warnings,
      next: changed ? `project_push_begin(projectId "${config.projectId}", baseVersion ${config.baseVersion}, manifest = content of ${relative})` : `Nothing changed since version ${config.baseVersion}.`
    },
    text: `Wrote ${relative}: ${summary3.fileCount} files, ${formatBytes(summary3.totalBytes)} (+${diff.added.length} ~${diff.modified.length} -${diff.deleted.length} since version ${config.baseVersion}); ${state.manifest.videoRefs.length} video references (${refs.source})` + (refs.dropped.length ? `, not used by the pipeline: ${refs.dropped.join(", ")}` : "") + "." + warnings.map((warning) => `
warning: ${warning}`).join("")
  };
}
async function statusCommand(ctx, options) {
  const stored = await requireConfig(ctx.root);
  const refs = await resolveVideoRefs(ctx.root, stored);
  const config = { ...stored, videoRefs: refs.videoRefs };
  const state = await readLocalState(ctx.root, config, options);
  const base = await readBaseManifest(ctx.root, config);
  const diff = diffManifests(base, state.manifest);
  const written = await readManifestFile(statePaths(ctx.root).manifest).catch(() => null);
  const manifestState = !written ? "missing" : serializeCutProjectManifest(written) === serializeCutProjectManifest(state.manifest) ? "current" : "outdated";
  const clean = isEmptyDiff(diff);
  const added = capList(diff.added);
  const modified = capList(diff.modified);
  const deleted = capList(diff.deleted);
  return {
    data: {
      projectId: config.projectId,
      baseVersion: config.baseVersion,
      clean,
      added: added.items,
      modified: modified.items,
      deleted: deleted.items,
      ...added.truncated || modified.truncated || deleted.truncated ? { truncated: { added: added.truncated ?? 0, modified: modified.truncated ?? 0, deleted: deleted.truncated ?? 0 } } : {},
      unchanged: diff.unchanged,
      videoRefsAdded: diff.videoRefsAdded,
      videoRefsRemoved: diff.videoRefsRemoved,
      manifest: manifestState,
      ...refsData(refs),
      warnings: [...refsWarnings(refs), ...state.warnings]
    },
    text: clean ? `Project ${config.projectId}: no changes since version ${config.baseVersion} (manifest ${manifestState}).` : [
      `Project ${config.projectId}, changes since version ${config.baseVersion} (manifest ${manifestState}):`,
      ...diff.added.map((file) => `  added     ${file}`),
      ...diff.modified.map((file) => `  modified  ${file}`),
      ...diff.deleted.map((file) => `  deleted   ${file}`),
      ...diff.videoRefsAdded.map((ref) => `  video +   ${ref}`),
      ...diff.videoRefsRemoved.map((ref) => `  video -   ${ref}`)
    ].join("\n")
  };
}
async function pushedCommand(ctx, versionArg, options) {
  const version = Number(versionArg);
  if (!Number.isInteger(version) || version < 1) throw new CliError("invalid-input", "Usage: darkmind-agent pushed <version> (the version project_push_commit returned)");
  const config = await requireConfig(ctx.root);
  const paths = statePaths(ctx.root);
  const manifest = await readManifestFile(paths.manifest);
  if (!manifest) throw new CliError("no-manifest", "No .darkmind/manifest.json; nothing was pushed from this folder.");
  if (manifest.projectId.toLowerCase() !== config.projectId) {
    throw new CliError("project-mismatch", `.darkmind/manifest.json belongs to project ${manifest.projectId}, ${CONFIG_FILE} to ${config.projectId}.`);
  }
  if (version <= config.baseVersion && !options.force) {
    throw new CliError("invalid-version", `Version ${version} is not newer than the base version ${config.baseVersion} (--force to set it anyway).`);
  }
  await writeFileAtomic(paths.baseManifest, serializeCutProjectManifest(manifest));
  await writeConfig(ctx.root, { ...config, baseVersion: version });
  return {
    data: { projectId: config.projectId, baseVersion: version, previousBaseVersion: config.baseVersion },
    text: `Base version of ${config.projectId} is now ${version}.`
  };
}

// src/commands/download.ts
async function downloadCommand(ctx, ticket, options = {}) {
  if (!ticket) throw new CliError("invalid-input", "Usage: darkmind-agent download <ticket> [--force]");
  await fs15.mkdir(ctx.root, { recursive: true });
  const config = await readConfig(ctx.root);
  const server = resolveServer(ctx.server, config, ctx.env);
  const transfer = expectKind(await redeemTicket(server, ticket), "pull", "download");
  const projectId = transfer.projectId.toLowerCase();
  if (config && config.projectId !== projectId && !options.force) {
    throw new CliError(
      "project-mismatch",
      `This folder belongs to project ${config.projectId}, the ticket to ${projectId}. Use an empty folder (or --force to switch this folder).`
    );
  }
  const validation = validateCutProjectManifest(transfer.manifest);
  if (!validation.success) throw new CliError("invalid-manifest", `Dark Mind sent an invalid manifest: ${validation.errors[0]}`);
  const target = canonicalizeCutProjectManifest(validation.manifest);
  if (sha256Hex(serializeCutProjectManifest(target)) !== transfer.manifestSha256 || target.projectId !== projectId) {
    throw new CliError("manifest-hash-mismatch", "The manifest does not match its SHA-256; download again with a new ticket.");
  }
  const urls = new Map(transfer.objects.map((object) => [object.sha256, object]));
  const withoutUrl = target.files.filter((file) => !urls.has(file.sha256));
  if (withoutUrl.length > 0) throw new CliError("incomplete-ticket", `The ticket has no download URL for ${withoutUrl.length} file(s).`);
  const sameProject = config?.projectId === projectId;
  const base = sameProject && config ? await readBaseManifest(ctx.root, config) : null;
  const baseByPath = new Map((base?.files ?? []).map((file) => [file.path, file.sha256]));
  const targetPaths = new Set(target.files.map((file) => file.path));
  const paths = statePaths(ctx.root);
  const cache = await HashCache.load(paths.hashes);
  async function localHash(file) {
    const absolute = toAbsolute(ctx.root, file);
    try {
      const stat = await fs15.stat(absolute);
      if (stat.isDirectory()) return "directory";
      return await cache.hash(file, absolute, stat.size, stat.mtimeMs);
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") return "missing";
      throw error;
    }
  }
  const writes = [];
  const deletes = [];
  const conflicts = [];
  let unchanged = 0;
  for (const file of target.files) {
    const local = await localHash(file.path);
    if (local === file.sha256) {
      unchanged++;
      continue;
    }
    writes.push(file);
    if (local === "missing") continue;
    const baseSha = baseByPath.get(file.path);
    if (local === "directory") conflicts.push({ path: file.path, reason: "a folder exists at this path" });
    else if (baseSha === void 0) conflicts.push({ path: file.path, reason: "local file not in the base version" });
    else if (local !== baseSha) conflicts.push({ path: file.path, reason: "modified locally" });
  }
  for (const [file, baseSha] of baseByPath) {
    if (targetPaths.has(file)) continue;
    const local = await localHash(file);
    if (local === "missing") continue;
    if (local !== baseSha) {
      conflicts.push({ path: file, reason: `modified locally, removed in version ${transfer.version}` });
      if (!options.force) continue;
    }
    deletes.push(file);
  }
  await cache.save();
  if (conflicts.length > 0 && !options.force) {
    const listed2 = capList(conflicts, 50);
    throw new CliError(
      "local-changes",
      `${conflicts.length} local change(s) would be overwritten by version ${transfer.version}: ${conflicts.slice(0, 5).map((item) => `${item.path} (${item.reason})`).join("; ")}. Push them first or copy them away, or use --force to replace them.`,
      { conflicts: listed2.items, ...listed2.truncated ? { truncated: listed2.truncated } : {} }
    );
  }
  const needed = [...new Map(writes.map((file) => [file.sha256, file])).values()];
  const objectDir = path14.join(paths.tmp, "objects");
  await fs15.mkdir(objectDir, { recursive: true });
  let done = 0;
  const downloads = await runPool(needed, options.concurrency ?? 4, async (file) => {
    const object = urls.get(file.sha256);
    const result = await downloadFile(object.url, path14.join(objectDir, file.sha256), { size: file.size, sha256: file.sha256, label: file.path });
    ctx.progress(`downloaded ${++done}/${needed.length} ${file.path} (${formatBytes(file.size)})`);
    return result;
  });
  for (const file of deletes) await fs15.rm(toAbsolute(ctx.root, file), { force: true });
  const remainingUses = /* @__PURE__ */ new Map();
  for (const file of writes) remainingUses.set(file.sha256, (remainingUses.get(file.sha256) ?? 0) + 1);
  for (const file of writes) {
    const absolute = toAbsolute(ctx.root, file.path);
    const source = path14.join(objectDir, file.sha256);
    await fs15.mkdir(path14.dirname(absolute), { recursive: true });
    const stat = await fs15.stat(absolute).catch(() => null);
    if (stat?.isDirectory()) await fs15.rm(absolute, { recursive: true, force: true });
    const uses = remainingUses.get(file.sha256) - 1;
    remainingUses.set(file.sha256, uses);
    if (uses > 0) {
      const temp = `${absolute}.darkmind-tmp`;
      await fs15.copyFile(source, temp);
      await renameWithRetry(temp, absolute);
    } else {
      await renameWithRetry(source, absolute);
    }
  }
  await fs15.rm(objectDir, { recursive: true, force: true });
  const baseRefs = new Set(base?.videoRefs ?? []);
  const localAdditions = sameProject && !options.force ? (config?.videoRefs ?? []).filter((ref) => !baseRefs.has(ref)) : [];
  const videoRefs = [...new Set([...target.videoRefs, ...localAdditions].map(normalizeCutProjectVideoId))];
  await writeFileAtomic(paths.baseManifest, serializeCutProjectManifest(target));
  const nextConfig = {
    ...sameProject && config ? config : {},
    projectId,
    server,
    baseVersion: transfer.version,
    videoRefs
  };
  await writeConfig(ctx.root, nextConfig);
  const downloadedBytes = needed.reduce((sum, file) => sum + file.size, 0);
  const resumedBytes = downloads.reduce((sum, result) => sum + result.resumedBytes, 0);
  const hasExtensions = target.files.some((file) => /^extensions\/[^/]+\/extension\.json$/i.test(file.path));
  const hasPackage = target.files.some((file) => /^extensions\/package\.json$/i.test(file.path));
  const prepare = hasExtensions ? ` Before "darkmind-agent preview" or a render: "darkmind-agent plan" (proxies to load)${hasPackage ? `, "npm ci" in extensions/ (the user's step)` : ""}, "darkmind-agent extensions show <id>" \u2192 the user agrees \u2192 "extensions approve", then "darkmind-agent extensions run" \u2013 a pull brings no rendered extension outputs.` : "";
  return {
    data: {
      projectId,
      version: transfer.version,
      fileCount: target.files.length,
      written: writes.length,
      deleted: deletes.length,
      unchanged,
      downloadedBytes,
      ...resumedBytes > 0 ? { resumedBytes } : {},
      ...options.force && conflicts.length > 0 ? { replacedLocalChanges: conflicts.map((item) => item.path) } : {},
      ...localAdditions.length > 0 ? { keptLocalVideoRefs: localAdditions } : {},
      next: `Work in this folder; "darkmind-agent status" lists changes, "darkmind-agent manifest" prepares a push (needs the lock: project_checkout).${prepare}`
    },
    text: `Version ${transfer.version} of ${projectId}: ${writes.length} file(s) written (${formatBytes(downloadedBytes)}), ${deletes.length} deleted, ${unchanged} unchanged.${prepare ? `
next:${prepare}` : ""}`
  };
}

// src/commands/export.ts
import path25 from "node:path";

// src/pipeline/premiere.ts
import { promises as fs26 } from "node:fs";
import path24 from "node:path";

// src/pipeline/extensions.ts
import { spawn as spawn3 } from "node:child_process";
import { promises as fs20 } from "node:fs";
import { createRequire } from "node:module";
import path18 from "node:path";

// src/pipeline/facts.ts
import { promises as fs16 } from "node:fs";
function probeRational(value2) {
  if (value2 === void 0 || value2 === null) return null;
  const text3 = String(value2).trim();
  if (!text3 || text3 === "N/A" || text3 === "0/0") return null;
  const fraction = /^(-?\d+)\/(\d+)$/.exec(text3);
  if (fraction) return BigInt(fraction[2]) === 0n ? null : rational(BigInt(fraction[1]), BigInt(fraction[2]));
  const decimal = /^(-?)(\d+)(?:\.(\d+))?$/.exec(text3);
  if (!decimal) return null;
  const digits = decimal[3] ?? "";
  return rational(BigInt(decimal[2] + digits) * (decimal[1] ? -1n : 1n), 10n ** BigInt(digits.length));
}
function displayRotation(stream) {
  const side = stream.side_data_list?.find((entry) => typeof entry.rotation === "number");
  const raw = side?.rotation ?? (stream.tags?.rotate !== void 0 ? -Number(stream.tags.rotate) : 0);
  if (!Number.isFinite(raw)) return 0;
  const rounded = Math.round(raw / 90) * 90;
  return rounded % 360 === 0 ? 0 : rounded;
}
var ALPHA_FORMATS = /^(yuva|rgba|bgra|argb|abgr|gbrap|ya[0-9])/;
function parseFfprobe(json2) {
  const data = JSON.parse(json2 || "{}");
  const streams = data.streams ?? [];
  const v = streams.find((s) => s.codec_type === "video" && !s.disposition?.attached_pic);
  const a = streams.find((s) => s.codec_type === "audio");
  let video = null;
  if (v && v.width && v.height) {
    const rotation = displayRotation(v);
    const swap = Math.abs(rotation) % 180 === 90;
    const sar = v.sample_aspect_ratio && /^[1-9]\d*:[1-9]\d*$/.test(v.sample_aspect_ratio) ? v.sample_aspect_ratio : "1:1";
    const frames = Number(v.nb_frames);
    video = {
      index: v.index,
      codec: v.codec_name ?? "unknown",
      pixelFormat: v.pix_fmt ?? "unknown",
      storedWidth: v.width,
      storedHeight: v.height,
      width: swap ? v.height : v.width,
      height: swap ? v.width : v.height,
      rotation,
      timeBase: probeRational(v.time_base) ?? rational(1, 9e4),
      rFrameRate: probeRational(v.r_frame_rate),
      avgFrameRate: probeRational(v.avg_frame_rate),
      sampleAspectRatio: sar,
      colorTransfer: v.color_transfer ?? null,
      colorPrimaries: v.color_primaries ?? null,
      colorSpace: v.color_space ?? null,
      colorRange: v.color_range ?? null,
      alpha: ALPHA_FORMATS.test(v.pix_fmt ?? ""),
      frames: Number.isInteger(frames) && frames > 0 ? frames : null
    };
  }
  const size = Number(data.format?.size);
  return {
    formatName: data.format?.format_name ?? "",
    formatStart: probeRational(data.format?.start_time) ?? rational(0),
    durationSeconds: probeRational(data.format?.duration),
    size: Number.isFinite(size) ? size : null,
    video,
    audio: a ? { index: a.index, codec: a.codec_name ?? "unknown", sampleRate: Number(a.sample_rate) || 0, channels: a.channels ?? 0 } : null
  };
}
function scrubUrls(text3) {
  return text3.replace(/https?:\/\/\S+/g, "<url>");
}
async function probeStreams(tools, input, options = {}) {
  let result;
  try {
    result = await tools.run(tools.ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", input], { timeoutMs: 12e4, signal: options.signal });
  } catch (error) {
    if (error.code === "ENOENT") throw new CliError("ffmpeg-missing", "ffprobe was not found; install ffmpeg (in PATH) or set DARKMIND_FFPROBE.");
    throw error;
  }
  if (result.code !== 0) {
    const reason = result.stderr.trim().split(/\r?\n/).filter(Boolean).pop() ?? `exit code ${result.code}`;
    throw new CliError("invalid-media", `ffprobe cannot read the media: ${scrubUrls(reason)}`);
  }
  return parseFfprobe(result.stdout);
}
async function probeFramePts(tools, input, options = {}) {
  const args = ["-v", "error", "-select_streams", "v:0", "-show_entries", "packet=pts:stream=time_base:format=start_time", "-of", "json"];
  if (options.readIntervals) args.push("-read_intervals", options.readIntervals);
  args.push(input);
  const result = await tools.run(tools.ffprobe, args, { timeoutMs: 30 * 6e4, signal: options.signal });
  if (result.code !== 0) throw new CliError("invalid-media", scrubUrls(`ffprobe cannot read the frames: ${result.stderr.trim().split(/\r?\n/).pop() ?? ""}`));
  const data = JSON.parse(result.stdout || "{}");
  const timeBase = probeRational(data.streams?.[0]?.time_base) ?? rational(1, 9e4);
  const start = probeRational(data.format?.start_time) ?? rational(0);
  const pts = (data.packets ?? []).map((packet) => packet.pts === void 0 || packet.pts === "N/A" ? null : BigInt(packet.pts)).filter((value2) => value2 !== null).sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  return pts.map((value2) => subQ(rational(value2 * timeBase.n, timeBase.d), start));
}
function isVariableFrameRate(pts) {
  if (pts.length < 3) return false;
  const first = subQ(pts[1], pts[0]);
  for (let i = 2; i < pts.length - 1; i++) {
    const delta = subQ(pts[i], pts[i - 1]);
    if (delta.n !== first.n || delta.d !== first.d) return true;
  }
  return false;
}
async function fileByteReader(file) {
  const handle = await fs16.open(file, "r");
  return {
    size: async () => (await handle.stat()).size,
    async read(offset, length2) {
      const buffer = Buffer.alloc(length2);
      const { bytesRead } = await handle.read(buffer, 0, length2, offset);
      return buffer.subarray(0, bytesRead);
    },
    close: () => handle.close()
  };
}
function httpByteReader(url) {
  let total = null;
  const read = async (offset, length2) => {
    const response = await httpRequest(url, { headers: { Range: `bytes=${offset}-${offset + length2 - 1}` }, timeoutMs: 12e4 });
    if (response.statusCode !== 206) {
      if (response.statusCode === 200) {
        response.destroy();
        throw new Error("the server does not support range requests");
      }
      throw await toHttpError(response, "Range read failed");
    }
    const range2 = response.headers["content-range"];
    const match = typeof range2 === "string" ? /\/(\d+)$/.exec(range2) : null;
    if (match) total = Number(match[1]);
    return readBody(response, length2 + 1024);
  };
  return {
    async size() {
      if (total === null) await read(0, 16);
      return total ?? 0;
    },
    read,
    close: async () => {
    }
  };
}
function parseBoxes(buffer, start = 0, end = buffer.length) {
  const boxes = [];
  let offset = start;
  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString("latin1", offset + 4, offset + 8);
    let headerSize = 8;
    if (size === 1) {
      if (offset + 16 > end) break;
      size = Number(buffer.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < headerSize || offset + size > end) break;
    boxes.push({ type, start: offset, headerSize, size });
    offset += size;
  }
  return boxes;
}
var childBox = (buffer, box, type) => parseBoxes(buffer, box.start + box.headerSize, box.start + box.size).find((b) => b.type === type);
async function readMp4VideoTiming(reader, maxMoovBytes = 512 * 1024 * 1024) {
  const total = await reader.size();
  let offset = 0;
  let moov = null;
  for (let guard = 0; offset + 8 <= total && guard < 1e4; guard++) {
    const header = await reader.read(offset, 16);
    if (header.length < 8) break;
    let size = header.readUInt32BE(0);
    const type = header.toString("latin1", 4, 8);
    if (!/^[\x20-\x7e]{4}$/.test(type)) return null;
    if (size === 1) size = Number(header.readBigUInt64BE(8));
    else if (size === 0) size = total - offset;
    if (size < 8) return null;
    if (type === "moov") {
      if (size > maxMoovBytes) throw new Error(`moov box of ${size} bytes is too large`);
      moov = await reader.read(offset, size);
      break;
    }
    offset += size;
  }
  if (!moov) return null;
  const root = parseBoxes(moov)[0];
  if (!root) return null;
  for (const trak of parseBoxes(moov, root.start + root.headerSize, root.start + root.size).filter((b) => b.type === "trak")) {
    const mdia = childBox(moov, trak, "mdia");
    if (!mdia) continue;
    const hdlr = childBox(moov, mdia, "hdlr");
    if (!hdlr || moov.toString("latin1", hdlr.start + hdlr.headerSize + 8, hdlr.start + hdlr.headerSize + 12) !== "vide") continue;
    const mdhd = childBox(moov, mdia, "mdhd");
    const minf = childBox(moov, mdia, "minf");
    const stbl = minf && childBox(moov, minf, "stbl");
    const stts = stbl && childBox(moov, stbl, "stts");
    if (!mdhd || !stts) continue;
    const version = moov.readUInt8(mdhd.start + mdhd.headerSize);
    const timescale = moov.readUInt32BE(mdhd.start + mdhd.headerSize + (version === 1 ? 20 : 12));
    const base = stts.start + stts.headerSize;
    const count2 = moov.readUInt32BE(base + 4);
    const entries = [];
    let samples = 0;
    for (let i = 0; i < count2 && base + 16 + i * 8 <= stts.start + stts.size; i++) {
      const entry = { count: moov.readUInt32BE(base + 8 + i * 8), delta: moov.readUInt32BE(base + 12 + i * 8) };
      entries.push(entry);
      samples += entry.count;
    }
    if (samples === 0) return null;
    return { timescale, entries, samples };
  }
  return null;
}
function isVfrFromStts(timing) {
  const entries = timing.entries.filter((entry) => entry.count > 0);
  const relevant = entries.length > 1 && entries[entries.length - 1].count === 1 ? entries.slice(0, -1) : entries;
  return new Set(relevant.map((entry) => entry.delta)).size > 1;
}
async function detectVfr(tools, input, info) {
  if (!info.video) return { vfr: false, basis: "no-video" };
  if (/mov|mp4|m4a|3gp|mj2/.test(info.formatName)) {
    let reader = null;
    try {
      reader = input.file ? await fileByteReader(input.file) : httpByteReader(input.url);
      const timing = await readMp4VideoTiming(reader);
      if (timing) return { vfr: isVfrFromStts(timing), basis: "sample-table" };
    } catch {
    } finally {
      await reader?.close();
    }
  }
  if (input.file) return { vfr: isVariableFrameRate(await probeFramePts(tools, input.file)), basis: "all-frames" };
  return { vfr: isVariableFrameRate(await probeFramePts(tools, input.url, { readIntervals: "%+60" })), basis: "first-60s" };
}
var UNSIGNALLED2 = /* @__PURE__ */ new Set(["unknown", "unspecified", "reserved"]);
var signalled = (value2) => value2 && !UNSIGNALLED2.has(value2) ? value2 : null;
function toMediaFacts(info, vfr, probedFrom, probedAt) {
  if (!info.durationSeconds) throw new CliError("invalid-media", "the media has no duration (not time-based media)");
  const v = info.video;
  const colorSpace = v ? signalled(v.colorSpace) : null;
  return {
    durationSeconds: formatRationalReadable(info.durationSeconds, 9),
    video: v ? {
      width: v.width,
      height: v.height,
      rotation: v.rotation,
      frameRate: v.rFrameRate ? `${v.rFrameRate.n}/${v.rFrameRate.d}` : null,
      vfr,
      sampleAspectRatio: v.sampleAspectRatio,
      colorTransfer: signalled(v.colorTransfer),
      colorPrimaries: signalled(v.colorPrimaries),
      ...colorSpace ? { colorSpace } : {},
      codec: v.codec,
      pixelFormat: v.pixelFormat,
      ...v.alpha ? { alpha: true } : {}
    } : null,
    audio: info.audio ? { sampleRate: info.audio.sampleRate, channels: info.audio.channels, codec: info.audio.codec } : null,
    probedFrom,
    probedAt
  };
}
function factsDifferences(recorded, measured, options = {}) {
  const differences = [];
  const tolerance = options.toleranceSeconds ?? 2e-3;
  const a = toNumberQ(parseRational(recorded.durationSeconds));
  const b = toNumberQ(parseRational(measured.durationSeconds));
  if (Math.abs(a - b) > tolerance) differences.push(`duration ${recorded.durationSeconds} s \u2192 ${measured.durationSeconds} s`);
  const rv = recorded.video;
  const mv = measured.video;
  if (Boolean(rv) !== Boolean(mv)) differences.push(`video stream ${rv ? "present" : "absent"} \u2192 ${mv ? "present" : "absent"}`);
  if (rv && mv) {
    if (rv.width !== mv.width || rv.height !== mv.height) differences.push(`size ${rv.width}x${rv.height} \u2192 ${mv.width}x${mv.height}`);
    if (rv.rotation !== mv.rotation) differences.push(`rotation ${rv.rotation} \u2192 ${mv.rotation}`);
    if (rv.vfr !== mv.vfr) differences.push(`vfr ${rv.vfr} \u2192 ${mv.vfr}`);
  }
  if (Boolean(recorded.audio) !== Boolean(measured.audio)) differences.push(`audio stream ${recorded.audio ? "present" : "absent"} \u2192 ${measured.audio ? "present" : "absent"}`);
  return differences;
}
function describeProbeError(error) {
  return scrubUrls(errorMessage(error));
}

// src/pipeline/media-index.ts
import { promises as fs17 } from "node:fs";
import path15 from "node:path";
var PROXY_INDEX_FILE = "index.json";
var NOTE = "darkmind-agent proxy index (rule E1): original time = offset + file time. Local state, not synced.";
async function readProxyIndex(dir) {
  const data = await readJsonFile(path15.join(dir, PROXY_INDEX_FILE)).catch(() => null);
  return data?.version === 1 && Array.isArray(data.files) ? data : { version: 1, note: NOTE, files: [] };
}
async function updateProxyIndex(dir, entries, now = /* @__PURE__ */ new Date()) {
  const index = await readProxyIndex(dir);
  const byName = new Map(index.files.map((entry) => [entry.file.toLowerCase(), entry]));
  for (const entry of entries) {
    byName.set(entry.file.toLowerCase(), { ...entry, videoId: normalizeCutProjectVideoId(entry.videoId), createdAt: now.toISOString(), agentVersion: AGENT_VERSION });
  }
  const files = [];
  for (const entry of byName.values()) {
    if (await fs17.stat(path15.join(dir, entry.file)).catch(() => null)) files.push(entry);
  }
  files.sort((a, b) => a.file < b.file ? -1 : 1);
  await writeJsonFile(path15.join(dir, PROXY_INDEX_FILE), { version: 1, note: NOTE, files });
}
async function proxyCandidates(dir, videoId) {
  const id2 = normalizeCutProjectVideoId(videoId);
  const index = await readProxyIndex(dir);
  const names = await fs17.readdir(dir).catch(() => []);
  const candidates = [];
  const unknown = [];
  for (const name of names) {
    if (!name.toLowerCase().endsWith(".mp4") || name.toLowerCase().endsWith(".part.mp4")) continue;
    if (!name.toUpperCase().startsWith(id2)) continue;
    const entry = index.files.find((e) => e.file.toLowerCase() === name.toLowerCase());
    if (entry) {
      const offset = parseRational(entry.offset);
      const end = entry.durationSeconds ? addQ(offset, parseRational(entry.durationSeconds)) : null;
      candidates.push({ file: path15.join(dir, name), kind: entry.kind, offset, end });
    } else if (name.toUpperCase() === `${id2}.MP4`) {
      candidates.push({ file: path15.join(dir, name), kind: "full", offset: { n: 0n, d: 1n }, end: null });
    } else {
      unknown.push(name);
    }
  }
  return { candidates, unknown };
}

// src/pipeline/plan.ts
import { promises as fs18 } from "node:fs";
import path16 from "node:path";
var MEDIA_HASH_CACHE = "media-hashes.json";
function mediaHashCachePath(root) {
  return path16.join(root, EDIT_FOLDERS.localState, MEDIA_HASH_CACHE);
}
function toRel(root, file) {
  return path16.relative(root, file).split(path16.sep).join("/");
}
async function findOriginal(root, videoId) {
  const dir = path16.join(root, "media", "original");
  const id2 = normalizeCutProjectVideoId(videoId);
  const names = await fs18.readdir(dir).catch(() => []);
  const match = names.find((name) => {
    const upper = name.toUpperCase();
    return upper.startsWith(`${id2}.`) && !/\.(PART|TMP)$/.test(upper) && !upper.endsWith(".JSON");
  });
  return match ? path16.join(dir, match) : null;
}
function mergeRanges(windows, gap = 5) {
  const sorted = [...windows].sort((a, b) => a.from - b.from);
  const merged = [];
  for (const w of sorted) {
    const last = merged[merged.length - 1];
    if (last && w.from <= last.to + gap) last.to = Math.max(last.to, w.to);
    else merged.push({ ...w });
  }
  return merged;
}
async function buildExecutionPlan(options) {
  const { root, mode, tools } = options;
  const issues = [];
  const needs = [];
  const error = (code, message, ref) => issues.push({ severity: "error", code, message, ...ref ? { ref } : {} });
  const warning = (code, message, ref) => issues.push({ severity: "warning", code, message, ...ref ? { ref } : {} });
  const validation = await validateEditProject(projectReader(root));
  if (!validation.valid || !validation.documents) {
    error("validation-failed", `the project is invalid (${validation.counts.error} errors); run "darkmind-agent validate" and fix them first`);
    return { validation, plan: null, issues, needs };
  }
  const docs = validation.documents;
  const timeline = docs.timeline;
  if (!timeline || validation.totalFrames === null || validation.totalFrames === 0) {
    error("timeline-missing", "timeline.json does not exist or has no clips yet");
    return { validation, plan: null, issues, needs };
  }
  if (!validation.ready) {
    const codes = [...new Set(validation.issues.filter((issue) => issue.severity === "pending").map((issue) => issue.code))];
    warning("project-not-ready", `the project has pending points (${codes.join(", ")}); the render is a working state, not a reviewable version (F5)`);
  }
  const project = docs.project;
  const fps = parseRational(project.output.fps);
  const W = project.output.width;
  const H = project.output.height;
  const sources = new Map((docs.sources?.sources ?? []).map((source) => [source.id, source]));
  const extensions = new Map(docs.extensions.map((extension) => [extension.id, extension]));
  const files = [];
  const fileByPath = /* @__PURE__ */ new Map();
  const infoByPath = /* @__PURE__ */ new Map();
  const failedPaths = /* @__PURE__ */ new Set();
  const addFile = async (abs2, role, extra, ref) => {
    const key = abs2.toLowerCase();
    const known = fileByPath.get(key);
    if (known) return known;
    if (failedPaths.has(key)) return null;
    const stat = await fs18.stat(abs2).catch(() => null);
    if (!stat?.isFile()) {
      failedPaths.add(key);
      error("media-missing", `${toRel(root, abs2)} does not exist`, ref);
      return null;
    }
    let info;
    try {
      info = await probeStreams(tools, abs2, { signal: options.signal });
    } catch (probeError) {
      failedPaths.add(key);
      error("media-unreadable", `${toRel(root, abs2)} is not readable media: ${describeProbeError(probeError)}`, ref);
      return null;
    }
    const v = info.video;
    const file = {
      id: files.length,
      path: toRel(root, abs2),
      role,
      offset: "0",
      size: stat.size,
      mtimeMs: Math.round(stat.mtimeMs),
      durationSeconds: info.durationSeconds ? formatRationalReadable(info.durationSeconds, 9) : null,
      video: v ? { width: v.width, height: v.height, rotation: v.rotation, timeBase: `${v.timeBase.n}/${v.timeBase.d}`, alpha: v.alpha, codec: v.codec, pixelFormat: v.pixelFormat, colorSpace: v.colorSpace } : null,
      audio: info.audio ? { sampleRate: info.audio.sampleRate, channels: info.audio.channels } : null,
      ...extra
    };
    if (v) {
      const color = assessColor({ durationSeconds: "1", video: { width: 1, height: 1, rotation: 0, frameRate: null, vfr: false, sampleAspectRatio: "1:1", colorTransfer: v.colorTransfer, colorPrimaries: v.colorPrimaries }, audio: null });
      if (color.status === "unsupported") error("color-unsupported", `${file.path}: ${color.message} (rule C2)`, ref);
      if (v.sampleAspectRatio !== "1:1") warning("non-square-pixels", `${file.path}: pixel aspect ${v.sampleAspectRatio} is not verified; the display size is used`, ref);
    }
    files.push(file);
    fileByPath.set(key, file);
    infoByPath.set(key, info);
    return file;
  };
  const windows = /* @__PURE__ */ new Map();
  const allClips = [...timeline.video.flatMap((t) => t.clips), ...timeline.audio.flatMap((t) => t.clips)];
  for (const clip of allClips) {
    if (!clip.sourceId) continue;
    const inExec = executedIn(parseRational(clip.in), fps);
    const frames = rangeFrames(parseRational(clip.in), parseRational(clip.out), fps);
    const list2 = windows.get(clip.sourceId) ?? [];
    list2.push({ clipId: clip.id, from: inExec, to: addQ(inExec, divQ(rational(frames), fps)) });
    windows.set(clip.sourceId, list2);
  }
  const clipFile = /* @__PURE__ */ new Map();
  const originalFacts = /* @__PURE__ */ new Map();
  const hashes = options.hashes ?? null;
  const verifyHash = async (abs2, file, expected, ref, what, compute) => {
    if (!expected && !compute) return;
    let actual = null;
    if (hashes) {
      actual = compute ? await hashes.cache.hash(file.path, abs2, file.size, file.mtimeMs) : hashes.cache.lookup(file.path, file.size, file.mtimeMs);
    }
    if (actual === null) return;
    file.sha256 = actual;
    if (expected && actual !== expected) error(`${what}-changed`, `${file.path} does not match the SHA-256 recorded in sources.json; a changed ${what} needs a new source revision`, ref);
  };
  const proxyIndex = options.virtualOriginals ? await readProxyIndex(path16.join(root, "media", "proxy")) : null;
  const virtualOriginal = async (sourceId, source, videoId, facts) => {
    const entry = proxyIndex?.files.find((e) => normalizeCutProjectVideoId(e.videoId) === videoId && (e.originalFileName || e.fileName));
    const name = entry?.originalFileName || entry?.fileName || source.fileName || "";
    const ext = path16.extname(name).toLowerCase();
    if (!/^\.[a-z0-9]{1,8}$/.test(ext)) {
      error("original-name-unknown", `the file type of the original of source "${sourceId}" (${videoId}) is unknown; load its complete proxy again with this darkmind-agent (get_media_sources(kind proxy) \u2192 darkmind-agent media <ticket>) or set "fileName" in sources.json`, sourceId);
      return null;
    }
    const abs2 = path16.join(root, "media", "original", `${videoId}${ext}`);
    const known = fileByPath.get(abs2.toLowerCase());
    if (known) return known;
    const v = facts.video;
    const file = {
      id: files.length,
      path: toRel(root, abs2),
      role: "original",
      sourceId,
      videoId,
      offset: "0",
      size: source.original?.size ?? 0,
      mtimeMs: 0,
      ...source.original?.sha256 ? { sha256: source.original.sha256 } : {},
      durationSeconds: facts.durationSeconds,
      video: v ? { width: v.width, height: v.height, rotation: v.rotation, timeBase: "1/90000", alpha: Boolean(v.alpha), codec: v.codec ?? "unknown", pixelFormat: v.pixelFormat ?? "unknown", colorSpace: v.colorSpace ?? null } : null,
      audio: facts.audio ? { sampleRate: facts.audio.sampleRate, channels: facts.audio.channels } : null,
      virtual: true
    };
    files.push(file);
    fileByPath.set(abs2.toLowerCase(), file);
    return file;
  };
  for (const [sourceId, list2] of windows) {
    const source = sources.get(sourceId);
    if (!source) continue;
    if (source.kind === "asset") {
      const abs2 = path16.join(root, ...source.path.split("/"));
      const file = await addFile(abs2, "asset", { sourceId }, sourceId);
      if (!file) continue;
      if (file.size !== source.size) error("asset-changed", `${source.path} has ${file.size} bytes, sources.json records ${source.size}; a changed asset needs a new source revision`, sourceId);
      else await verifyHash(abs2, file, source.sha256, sourceId, "asset", true);
      for (const w of list2) clipFile.set(w.clipId, file);
      continue;
    }
    const videoId = normalizeCutProjectVideoId(source.videoId);
    if (source.media) originalFacts.set(sourceId, source.media);
    const originalPath = await findOriginal(root, videoId);
    const useOriginal = async () => {
      if (!originalPath) return null;
      const file = await addFile(originalPath, "original", { sourceId, videoId }, sourceId);
      if (!file) return null;
      if (source.original?.size !== void 0 && source.original.size !== file.size) {
        error("original-changed", `${file.path} has ${file.size} bytes, sources.json records ${source.original.size}; a changed original needs a new source revision`, sourceId);
      } else {
        await verifyHash(originalPath, file, source.original?.sha256, sourceId, "original", Boolean(hashes?.computeOriginals));
      }
      return file;
    };
    if (mode === "original") {
      if (!originalPath && options.virtualOriginals && source.media) {
        const virtual = await virtualOriginal(sourceId, source, videoId, source.media);
        if (virtual) for (const w of list2) clipFile.set(w.clipId, virtual);
        continue;
      }
      const file = await useOriginal();
      if (!file) {
        if (!originalPath) {
          error("media-missing", `the original of source "${sourceId}" (${videoId}) is not in media/original/`, sourceId);
          needs.push({ videoId, sourceId, kind: "original", ranges: null, hint: `get_media_sources(kind original, ${videoId}) \u2192 darkmind-agent media <ticket>` });
        }
        continue;
      }
      if (!source.media) {
        error("media-facts-missing", `source "${sourceId}" has no recorded media facts; run "darkmind-agent probe --source ${sourceId}"`, sourceId);
      } else {
        const info = infoByPath.get(originalPath.toLowerCase());
        try {
          const measured = toMediaFacts(info, source.media.video?.vfr ?? false, "original", "");
          const differences = factsDifferences(source.media, measured);
          if (differences.length) error("media-facts-mismatch", `${file.path} differs from the facts recorded in sources.json (${differences.join("; ")}); probe again only if this is intended (new source revision)`, sourceId);
        } catch (factsError) {
          error("media-unreadable", `${file.path}: ${describeProbeError(factsError)}`, sourceId);
        }
      }
      for (const w of list2) clipFile.set(w.clipId, file);
      continue;
    }
    const { candidates, unknown } = await proxyCandidates(path16.join(root, "media", "proxy"), videoId);
    for (const name of unknown) warning("proxy-offset-unknown", `media/proxy/${name} has no entry in media/proxy/index.json (rule E1: unknown offset); it is ignored \u2013 load excerpts again with this darkmind-agent version`, sourceId);
    const missing = [];
    let fellBack = false;
    for (const w of list2) {
      const covering = candidates.filter((c) => compareQ(c.offset, w.from) <= 0 && (c.end === null || compareQ(c.end, w.to) >= 0)).sort((a, b) => length(a) - length(b));
      const chosen = covering[0];
      if (chosen) {
        const file = await addFile(chosen.file, "proxy", { sourceId, videoId, offset: formatRationalReadable(chosen.offset, 9) }, w.clipId);
        if (file) clipFile.set(w.clipId, file);
        continue;
      }
      const original = await useOriginal();
      if (original) {
        clipFile.set(w.clipId, original);
        fellBack = true;
      } else missing.push(w);
    }
    if (fellBack) warning("proxy-missing", `no proxy covers every clip of source "${sourceId}"; the local original is used for those clips (slower)`, sourceId);
    if (missing.length) {
      const ranges = mergeRanges(missing.map((w) => ({ from: Math.max(0, Math.floor(toNumberQ(w.from)) - 1), to: Math.ceil(toNumberQ(w.to)) + 1 })));
      error("media-missing", `no proxy covers clip(s) ${missing.map((w) => w.clipId).join(", ")} of source "${sourceId}" (${videoId})`, sourceId);
      needs.push({ videoId, sourceId, kind: "proxy", ranges, hint: `get_media_sources(kind proxy, ${videoId}) \u2192 darkmind-agent media <ticket> ${ranges.map((r) => `--range ${videoId}:${r.from}-${r.to}`).join(" ")}` });
    }
    if (!source.media) warning("media-facts-missing", `source "${sourceId}" has no recorded facts of the original; framing is derived from the proxy size (run "darkmind-agent probe" before the final render)`, sourceId);
  }
  for (const clip of allClips) {
    if (!clip.extensionId || clipFile.has(clip.id)) continue;
    const extension = extensions.get(clip.extensionId);
    if (!extension || options.withoutExtensionOutputs) continue;
    const abs2 = path16.join(root, ...extension.output.path.split("/"));
    const exists2 = await fs18.stat(abs2).catch(() => null);
    if (!exists2) {
      if (!issues.some((i) => i.code === "extension-output-missing" && i.ref === extension.id)) {
        (options.allowMissingExtensionOutputs ? warning : error)("extension-output-missing", `${extension.output.path} does not exist; run "darkmind-agent extensions run ${extension.id}" (render runs approved extensions itself)`, extension.id);
      }
      continue;
    }
    const file = await addFile(abs2, "extension", { extensionId: extension.id }, extension.id);
    if (!file) continue;
    clipFile.set(clip.id, file);
    if (hashes && !file.sha256) file.sha256 = await hashes.cache.hash(file.path, abs2, file.size, file.mtimeMs);
    const info = infoByPath.get(abs2.toLowerCase());
    if (!issues.some((i) => i.code === "extension-output" && i.ref === extension.id)) {
      const out = extension.output;
      const estimated = info.video ? info.video.frames ?? (info.durationSeconds ? Math.round(toNumberQ(info.durationSeconds) * toNumberQ(parseRational(out.fps))) : null) : null;
      const problems = extensionContractProblems(info, out, estimated);
      if (problems.length) error("extension-output", `${out.path} does not match the extension contract: ${problems.join(", ")} (no silent cutting or stretching)`, extension.id);
    }
  }
  const W2 = W;
  const buildClip = (kind, track, clip) => {
    const file = clipFile.get(clip.id);
    if (!file) return null;
    const inEditorial = parseRational(clip.in);
    const inExec = executedIn(inEditorial, fps);
    const frames = Number(rangeFrames(inEditorial, parseRational(clip.out), fps));
    const inLocal = subQ(inExec, parseRational(file.offset));
    if (inLocal.n < 0n) {
      error("proxy-offset", `clip starts before the proxy file ${file.path}`, clip.id);
      return null;
    }
    const result = {
      id: clip.id,
      trackId: track.id,
      trackRole: track.role,
      kind,
      ...clip.sourceId ? { sourceId: clip.sourceId } : {},
      ...clip.extensionId ? { extensionId: clip.extensionId } : {},
      ...clip.statementId ? { statementId: clip.statementId } : {},
      ...clip.sceneId ? { sceneId: clip.sceneId } : {},
      ...clip.brollId ? { brollId: clip.brollId } : {},
      in: clip.in,
      out: clip.out,
      inExec: formatRationalReadable(inExec, 9),
      inLocal: formatRationalReadable(inLocal, 9),
      frames,
      start: clip.start,
      end: clip.start + frames,
      file: file.id
    };
    if (kind === "audio") {
      if (!file.audio) {
        error("no-audio-stream", `${file.path} has no audio stream`, clip.id);
        return null;
      }
      result.gainDb = clip.gainDb ?? 0;
      return result;
    }
    if (!file.video) {
      error("no-video-stream", `${file.path} has no video stream`, clip.id);
      return null;
    }
    result.alpha = file.video.alpha;
    if (!clip.crop) {
      result.crop = { scaledWidth: W2, scaledHeight: H, offsetX: 0, offsetY: 0, basis: { width: file.video.width, height: file.video.height, from: "file" } };
      return result;
    }
    const facts = clip.sourceId ? originalFacts.get(clip.sourceId)?.video : void 0;
    const basis = facts ? { width: facts.width, height: facts.height, from: "original-facts" } : { width: file.video.width, height: file.video.height, from: "file" };
    if (facts) {
      const fileAspect = file.video.width / file.video.height;
      const factsAspect = facts.width / facts.height;
      if (Math.abs(fileAspect / factsAspect - 1) > 0.01) {
        error("aspect-mismatch", `${file.path} is ${file.video.width}x${file.video.height}, the original ${facts.width}x${facts.height} (different aspect; framing would differ)`, clip.id);
        return null;
      }
    }
    const geometry = cropGeometry(parseCrop(clip.crop), basis.width, basis.height, W, H);
    if (Math.abs(geometry.derivedWidth - W) > 0.5) {
      error("crop-aspect", `crop rectangle is ${geometry.derivedWidth.toFixed(1)} instead of ${W} output pixels wide for a ${basis.width}x${basis.height} source`, clip.id);
      return null;
    }
    result.crop = {
      scaledWidth: Math.max(geometry.scaledWidth, geometry.offsetX + W),
      scaledHeight: Math.max(geometry.scaledHeight, geometry.offsetY + H),
      offsetX: geometry.offsetX,
      offsetY: geometry.offsetY,
      basis
    };
    return result;
  };
  const video = timeline.video.map((track) => ({
    id: track.id,
    role: track.role,
    clips: track.clips.map((clip) => buildClip("video", track, clip)).filter((c) => c !== null)
  }));
  const audio = timeline.audio.map((track) => ({
    id: track.id,
    role: track.role,
    clips: track.clips.map((clip) => buildClip("audio", track, clip)).filter((c) => c !== null)
  }));
  const hasErrors = issues.some((issue) => issue.severity === "error");
  const plan = hasErrors ? null : {
    kind: "darkmind-execution-plan",
    version: 1,
    mode,
    output: { width: W, height: H, fps: `${fps.n}/${fps.d}`, sampleRate: project.output.sampleRate },
    totalFrames: validation.totalFrames,
    files,
    video,
    audio,
    captions: (docs.captions?.captions ?? []).map((caption) => ({ id: caption.id, start: caption.start, end: caption.end, text: caption.text })),
    captionStyle: docs.captions?.style ?? "plain",
    captionLanguage: docs.captions?.language ?? "en",
    gaps: timeline.gaps.map((gap) => ({ start: gap.start, end: gap.end, fill: gap.fill })),
    ...project.audioMaster ? { audioMaster: project.audioMaster } : {}
  };
  return { validation, plan, issues, needs };
}
function length(candidate) {
  return candidate.end === null ? Number.POSITIVE_INFINITY : toNumberQ(subQ(candidate.end, candidate.offset));
}
function extensionContractProblems(info, out, frames) {
  const problems = [];
  const v = info.video;
  if (out.image) {
    if (!v) problems.push("no picture");
    else {
      if (v.codec !== "png") problems.push(`codec ${v.codec} instead of png`);
      if (v.width !== out.width || v.height !== out.height) problems.push(`size ${v.width}x${v.height} instead of ${out.width}x${out.height}`);
      if (frames !== null && frames !== 1) problems.push(`${frames} frames instead of one still image`);
      if (out.alpha && !v.alpha) problems.push("no alpha channel although the contract declares alpha");
      if (!out.alpha && v.alpha) problems.push(`an alpha channel (${v.pixelFormat}) although the contract declares none`);
    }
  } else if (out.video === false) {
    if (v) problems.push(`a video stream (${v.codec}) although the contract declares audio only (video: false)`);
  } else if (!v) problems.push("no video stream");
  else {
    if (v.width !== out.width || v.height !== out.height) problems.push(`size ${v.width}x${v.height} instead of ${out.width}x${out.height}`);
    const rate = v.rFrameRate;
    if (!rate || compareQ(rate, parseRational(out.fps)) !== 0) problems.push(`frame rate ${rate ? `${rate.n}/${rate.d}` : "unknown"} instead of ${out.fps}`);
    if (frames !== null && frames !== out.durationFrames) problems.push(`${frames} frames instead of ${out.durationFrames}`);
    if (out.alpha && !v.alpha) problems.push("no alpha channel although the contract declares alpha");
    if (!out.alpha && v.alpha) problems.push(`an alpha channel (${v.pixelFormat}) although the contract declares none`);
  }
  if (out.audio && !info.audio) problems.push("no audio stream although the contract declares audio");
  if (!out.audio && info.audio) problems.push("an audio stream although the contract declares none");
  return problems;
}

// src/pipeline/preview-readiness.ts
import { promises as fs19 } from "node:fs";
import path17 from "node:path";
var BROWSER_VIDEO_CODECS = /* @__PURE__ */ new Set(["h264", "vp8", "vp9", "av1"]);
function browserPlayable(file) {
  if (!file.video) return true;
  const codec = file.video.codec.toLowerCase();
  if (!BROWSER_VIDEO_CODECS.has(codec)) return false;
  if (file.video.alpha) return (codec === "vp8" || codec === "vp9") && /\.webm$/i.test(file.path);
  return true;
}
function browserCopyArgs(input, output, file) {
  const alpha = Boolean(file.video?.alpha);
  return [
    "-hide_banner",
    "-nostdin",
    "-loglevel",
    "error",
    "-y",
    "-i",
    input,
    ...file.video ? ["-map", "0:v:0", "-c:v", "libvpx-vp9", "-pix_fmt", alpha ? "yuva420p" : "yuv420p", "-deadline", "realtime", "-cpu-used", "8", "-row-mt", "1", "-crf", "30", "-b:v", "0"] : [],
    ...alpha ? ["-auto-alt-ref", "0"] : [],
    ...file.audio ? ["-map", "0:a:0", "-c:a", "libopus", "-b:a", "160k", "-ac", "2", "-ar", "48000"] : ["-an"],
    "-f",
    "webm",
    output
  ];
}
async function npmInstallDir(root, extensionDir) {
  for (let dir = extensionDir; ; dir = path17.dirname(dir)) {
    if ((await fs19.stat(path17.join(dir, "package.json")).catch(() => null))?.isFile()) return path17.relative(root, dir).split(path17.sep).join("/") || ".";
    if (path17.relative(root, dir) === "" || dir === path17.dirname(dir)) break;
  }
  return path17.relative(root, extensionDir).split(path17.sep).join("/") || ".";
}
async function previewReadiness(root, states, needs, captionExtensions) {
  const used = states.filter((s) => s.needed);
  const elements = used.filter((s) => s.status !== "current").map((s) => ({
    id: s.id,
    status: s.output.exists ? "outdated" : "missing",
    captions: captionExtensions.has(s.id),
    reason: s.reason
  }));
  if (!elements.length) return { elements, steps: [] };
  const steps = [];
  const npmDirs = /* @__PURE__ */ new Map();
  const otherTools = /* @__PURE__ */ new Map();
  for (const state of used) {
    for (const problem of state.problems.filter((p) => p.code === "extension-tool-missing")) {
      if (/tool "npm:/.test(problem.message)) {
        const dir = await npmInstallDir(root, path17.dirname(path17.join(root, ...state.file.split("/"))));
        npmDirs.set(dir, [...npmDirs.get(dir) ?? [], state.id]);
      } else {
        otherTools.set(problem.message, [...otherTools.get(problem.message) ?? [], state.id]);
      }
    }
  }
  for (const [dir, ids] of npmDirs) {
    steps.push({
      kind: "install",
      ids,
      commands: ["darkmind-agent extensions run", `npm ci  (in ${dir === "." ? "the project folder" : `${dir}/`} of the project folder)`],
      note: `Installs playwright-core for the picture blocks. For an unchanged brand pack "darkmind-agent extensions run" installs it by itself (npm ci --ignore-scripts from the pack's lock file); other npm packages are the user's step: ask them to run "npm ci", or run it only with their explicit consent.`
    });
  }
  for (const [message, ids] of otherTools) steps.push({ kind: "install", ids, commands: [], note: message });
  const proxyHints = needs.filter((n) => n.kind === "proxy").map((n) => n.hint);
  const readers = used.filter((s) => s.problems.some((p) => p.code === "extension-input-missing"));
  if (proxyHints.length || readers.length) {
    steps.push({
      kind: "media",
      ids: readers.map((s) => s.id),
      commands: proxyHints.length ? proxyHints : [...new Set(readers.flatMap((s) => s.problems.filter((p) => p.code === "extension-input-missing").map((p) => p.message)))],
      note: readers.length ? "Proxies of the timeline clips; blocks such as band cards read the material, too." : "Proxies of the timeline clips."
    });
  }
  const unapproved = used.filter((s) => !s.trust.approved && (s.status === "stale" || s.status === "blocked"));
  if (unapproved.length) {
    steps.push({
      kind: "approve",
      ids: unapproved.map((s) => s.id),
      commands: unapproved.map((s) => `darkmind-agent extensions show ${s.id}`),
      note: "Pulling never runs code: free extensions need a local approval in this folder (.darkmind/, not a review) \u2013 unchanged brand blocks of the installed skill do not. Show each listed command to the user; only after they agreed: darkmind-agent extensions approve <id> --hash <hash shown> --yes."
    });
  }
  steps.push({
    kind: "run",
    ids: elements.map((e) => e.id),
    commands: ["darkmind-agent extensions run"],
    note: "Renders the outputs (seconds to a few minutes); the open preview reloads by itself when they appear."
  });
  return { elements, steps };
}

// src/pipeline/extensions.ts
var EXTENSION_RUNNER_VERSION = "wp4-1";
var TRUST_VERSION = 1;
var APPROVALS_FILE = "extension-approvals.json";
var MAX_APPROVALS = 200;
var CACHE_KEEP = 10;
var DEFAULT_TIMEOUT_MS = 60 * 6e4;
var TAIL_BYTES = 16 * 1024;
var rel = (root, file) => path18.relative(root, file).split(path18.sep).join("/");
var abs = (root, file) => path18.join(root, ...file.split("/"));
function cacheDir(root, extensionId) {
  return path18.join(root, "renders", ".cache", "extensions", extensionId);
}
function approvalsPath(root) {
  return path18.join(root, EDIT_FOLDERS.localState, APPROVALS_FILE);
}
function envValue2(env, name) {
  if (env[name] !== void 0) return env[name];
  const key = Object.keys(env).find((k) => k.toUpperCase() === name.toUpperCase());
  return key ? env[key] : void 0;
}
async function isFile2(file) {
  return (await fs20.stat(file).catch(() => null))?.isFile() ?? false;
}
async function resolveProgram(program, root, env) {
  if (/[\\/]/.test(program)) {
    const normalised = program.replace(/\\/g, "/").replace(/^(\.\/)+/, "");
    if (path18.isAbsolute(program) || /^[A-Za-z]:/.test(program) || normalised.split("/").includes("..")) {
      return { resolved: null, problem: { code: "extension-path-outside", message: `program "${program}" lies outside the project folder; use a program from PATH (node, ffmpeg \u2026) or a declared script in the project` } };
    }
    const file = abs(root, normalised);
    return await isFile2(file) ? { resolved: file } : { resolved: null, problem: { code: "extension-input-missing", message: `program "${normalised}" does not exist in the project` } };
  }
  const dirs = (envValue2(env, "PATH") ?? "").split(path18.delimiter).map((d) => d.replace(/^"|"$/g, "")).filter((d) => d && path18.isAbsolute(d));
  const windows = process.platform === "win32";
  const suffixes = windows ? ["", ...(envValue2(env, "PATHEXT") ?? ".COM;.EXE;.BAT;.CMD").split(";").filter(Boolean)] : [""];
  for (const dir of dirs) {
    for (const suffix of suffixes) {
      if (windows && suffix === "" && !path18.extname(program)) continue;
      const candidate = path18.join(dir, `${program}${suffix}`);
      if (await isFile2(candidate)) {
        if (windows && /\.(cmd|bat)$/i.test(candidate)) {
          return {
            resolved: null,
            problem: { code: "extension-program-unsupported", message: `"${program}" resolves to ${candidate}; commands run without a shell, so .cmd/.bat programs cannot run \u2013 call the underlying program (e.g. "node <script>") instead` }
          };
        }
        return { resolved: candidate };
      }
    }
  }
  return { resolved: null, problem: { code: "extension-tool-missing", message: `program "${program}" was not found in PATH; install it yourself (nothing is installed automatically)` } };
}
function versionParts(version) {
  const match = /(\d+(?:\.\d+)*)/.exec(version);
  return match ? match[1].split(".").map(Number) : null;
}
function versionSatisfies(version, required) {
  const actual = versionParts(version);
  const spec = required.trim();
  if (!actual) return null;
  if (spec.startsWith(">=")) {
    const min = versionParts(spec.slice(2));
    if (!min) return null;
    for (let i = 0; i < min.length; i++) {
      const a = actual[i] ?? 0;
      if (a !== min[i]) return a > min[i];
    }
    return true;
  }
  if (!/^v?\d+(\.(\d+|x|\*))*$/i.test(spec)) return null;
  const parts = spec.replace(/^v/i, "").split(".").filter((p) => p !== "x" && p !== "*").map(Number);
  return parts.every((part, i) => actual[i] === part);
}
async function findPackage(name, startDir, root, env) {
  const dirs = [];
  for (let dir = startDir; ; dir = path18.dirname(dir)) {
    dirs.push(path18.join(dir, "node_modules"));
    if (path18.relative(root, dir) === "" || dir === path18.dirname(dir)) break;
  }
  dirs.push(...(envValue2(env, "NODE_PATH") ?? "").split(path18.delimiter).filter(Boolean));
  for (const dir of dirs) {
    const manifest = path18.join(dir, ...name.split("/"), "package.json");
    const data = await readJsonFile(manifest).catch(() => null);
    if (data?.version) return { resolved: path18.dirname(manifest), version: data.version, digest: (await hashFile(manifest)).sha256 };
  }
  try {
    const require2 = createRequire(path18.join(startDir, "noop.js"));
    const manifest = require2.resolve(`${name}/package.json`);
    const data = await readJsonFile(manifest);
    if (data?.version) return { resolved: path18.dirname(manifest), version: data.version, digest: (await hashFile(manifest)).sha256 };
  } catch {
  }
  return null;
}
async function firstLine(program, args) {
  const result = await runCommand(program, args, { cwd: process.cwd(), env: process.env, timeoutMs: 15e3 }).catch(() => null);
  if (!result || result.code !== 0) return null;
  return result.stdout.split(/\r?\n/)[0].trim() || null;
}
async function detectTools(extension, ctx, extensionDir) {
  const result = [];
  for (const tool of extension.tools) {
    const required = tool.version ?? null;
    let resolved = null;
    let version = null;
    let digest;
    if (tool.name === "ffmpeg" || tool.name === "ffprobe") {
      version = (await toolVersion(ctx.tools, tool.name))?.replace(/^ff(mpeg|probe) version\s+/, "") ?? null;
      resolved = version ? ctx.tools[tool.name] : null;
    } else if (tool.name.startsWith("npm:")) {
      const found = await findPackage(tool.name.slice(4), extensionDir, ctx.root, ctx.env);
      resolved = found?.resolved ?? null;
      version = found?.version ?? null;
      digest = found?.digest;
    } else {
      const override = envValue2(ctx.env, `DARKMIND_TOOL_${tool.name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`);
      resolved = override && await isFile2(override) ? override : (await resolveProgram(tool.name, ctx.root, ctx.env)).resolved;
      if (resolved && tool.name === "node") version = await firstLine(resolved, ["--version"]);
    }
    let status2 = "ok";
    if (!resolved) status2 = "missing";
    else if (required) {
      const ok = version ? versionSatisfies(version, required) : null;
      status2 = ok === null ? "unverified" : ok ? "ok" : "version-mismatch";
    }
    result.push({ name: tool.name, required, resolved, version, status: status2, ...digest ? { digest } : {} });
  }
  return result;
}
async function loadApprovals(root) {
  const data = await readJsonFile(approvalsPath(root)).catch(() => null);
  return data?.version === 1 && Array.isArray(data.approvals) ? data : { version: 1, note: "darkmind-agent: local approvals to run extension commands in this folder (not synced, not a review).", approvals: [] };
}
function trustHash(extensionId, execution) {
  return sha256Hex(canonicalJson({ version: TRUST_VERSION, extensionId, execution }));
}
async function recordApproval(root, state, method, now = /* @__PURE__ */ new Date()) {
  if (!state.trust.execution || !state.trust.hash) throw new CliError("extension-not-approvable", `extension "${state.id}" cannot be approved: ${state.problems.map((p) => p.message).join("; ")}`);
  const file = await loadApprovals(root);
  const approval = { extensionId: state.id, hash: state.trust.hash, approvedAt: now.toISOString(), method, execution: state.trust.execution };
  file.approvals = [...file.approvals.filter((a) => !(a.extensionId === state.id && a.hash === approval.hash)), approval].slice(-MAX_APPROVALS);
  await writeJsonFile(approvalsPath(root), file);
  return approval;
}
function executionChanges(before, after) {
  if (!before) return ["never approved in this folder"];
  const changes = [];
  if (before.program.resolved !== after.program.resolved) changes.push(`program ${before.program.resolved ?? "\u2013"} \u2192 ${after.program.resolved ?? "\u2013"}`);
  if (canonicalJson(before.args) !== canonicalJson(after.args)) changes.push(`arguments ${JSON.stringify(before.args)} \u2192 ${JSON.stringify(after.args)}`);
  const tools = (e) => new Map(e.tools.map((t) => [t.name, `${t.version ?? "?"} at ${t.resolved ?? "missing"}`]));
  const [tb, ta] = [tools(before), tools(after)];
  for (const name of /* @__PURE__ */ new Set([...tb.keys(), ...ta.keys()])) if (tb.get(name) !== ta.get(name)) changes.push(`tool ${name}: ${tb.get(name) ?? "not declared"} \u2192 ${ta.get(name) ?? "not declared"}`);
  for (const file of /* @__PURE__ */ new Set([...Object.keys(before.code), ...Object.keys(after.code)])) {
    const [b, a] = [before.code[file], after.code[file]];
    if (b === a) continue;
    changes.push(b === void 0 ? `new file ${file}` : a === void 0 ? `file ${file} no longer an input` : `changed ${file}`);
  }
  return changes;
}
async function syncProblem(root, matcher, file) {
  const parts = file.split("/");
  for (let i = 1; i <= parts.length; i++) {
    const partial = parts.slice(0, i).join("/");
    const directory = i < parts.length;
    if (matcher.ignores(partial, directory)) return `${file} is excluded from the project sync (.darkmindignore); the archive would not contain it \u2013 move it or remove the exclusion`;
    if ((await fs20.lstat(abs(root, partial)).catch(() => null))?.isSymbolicLink()) return `${partial} is a symbolic link, which the project sync does not follow; use a real file in the project`;
  }
  return null;
}
function isCode(file, artefacts, named) {
  if (named.has(file.toLowerCase())) return true;
  if (artefacts.has(file.toLowerCase())) return false;
  const kind = kindByExtension(file);
  return kind !== "audio" && kind !== "image" && kind !== "video";
}
function namedFiles(extension) {
  const named = /* @__PURE__ */ new Set();
  for (const value2 of [extension.command.program, ...extension.command.args]) {
    for (const candidate of [value2, value2.includes("=") ? value2.slice(value2.indexOf("=") + 1) : null]) {
      if (candidate) named.add(candidate.replace(/\\/g, "/").replace(/^(\.\/)+/, "").toLowerCase());
    }
  }
  return named;
}
async function packageManifests(root, files) {
  const found = /* @__PURE__ */ new Set();
  for (const file of files) {
    for (let dir = path18.posix.dirname(file); ; dir = path18.posix.dirname(dir)) {
      const manifest = dir === "." ? "package.json" : `${dir}/package.json`;
      if (await isFile2(abs(root, manifest))) found.add(manifest);
      if (dir === "." || dir === "/") break;
    }
  }
  return [...found].sort();
}
async function readRecord(root, extensionId, key) {
  const record = await readJsonFile(path18.join(cacheDir(root, extensionId), `${key}.json`)).catch(() => null);
  return record?.kind === "darkmind-extension-run" && record.key === key ? record : null;
}
function neededExtensions(docs) {
  const used = /* @__PURE__ */ new Set();
  for (const track of [...docs.timeline?.video ?? [], ...docs.timeline?.audio ?? []]) for (const clip of track.clips) if (clip.extensionId) used.add(clip.extensionId);
  return new Set(extensionExecutionOrder(docs.extensions, used));
}
async function inspectOne(ctx, docs, extension, file, needed, options) {
  const { root, mode } = ctx;
  const problems = [];
  const warnings = [];
  const sources = new Map((docs.sources?.sources ?? []).map((s) => [s.id, s]));
  const extensionDir = path18.dirname(abs(root, file));
  const artefacts = new Set([EDIT_DEFAULT_FILES.project, ...Object.values(docs.project.artifacts).filter((p) => Boolean(p))].map((p) => p.toLowerCase()));
  const inputs = { files: {}, sources: {}, extensions: {} };
  const fileHashes = {};
  const sourceKeys = {};
  const upstreamKeys = {};
  let modeDependent = false;
  let waitingFor = null;
  for (const input of extension.inputs) {
    if (input.kind === "file") {
      const absolute = abs(root, input.path);
      const stat2 = await fs20.stat(absolute).catch(() => null);
      if (!stat2?.isFile()) {
        problems.push({ code: "extension-input-missing", message: `${input.path} does not exist; restore it from the project archive (darkmind-agent download) \u2013 saved inputs such as AI media are never regenerated automatically` });
        fileHashes[input.path] = null;
        continue;
      }
      const notSynced = await syncProblem(root, options.matcher, input.path);
      if (notSynced) problems.push({ code: "extension-input-not-synced", message: notSynced });
      fileHashes[input.path] = await options.hashCache.hash(input.path, absolute, stat2.size, Math.round(stat2.mtimeMs));
      inputs.files[input.path] = absolute;
    } else if (input.kind === "source") {
      const source = sources.get(input.sourceId);
      if (!source) {
        problems.push({ code: "unknown-source", message: `source "${input.sourceId}" is not in sources.json` });
        continue;
      }
      if (source.kind === "asset") {
        const absolute = abs(root, source.path);
        const stat3 = await fs20.stat(absolute).catch(() => null);
        if (!stat3?.isFile()) {
          problems.push({ code: "extension-input-missing", message: `asset ${source.path} (source "${source.id}") does not exist; restore it from the project archive \u2013 AI media is never regenerated automatically` });
          continue;
        }
        const assetNotSynced = await syncProblem(root, options.matcher, source.path);
        if (assetNotSynced) problems.push({ code: "extension-input-not-synced", message: assetNotSynced });
        const sha2 = await options.hashCache.hash(source.path, absolute, stat3.size, Math.round(stat3.mtimeMs));
        if (source.sha256 && sha2 !== source.sha256) problems.push({ code: "asset-changed", message: `${source.path} does not match the SHA-256 in sources.json; a changed asset needs a new source revision` });
        inputs.sources[source.id] = { path: source.path, file: absolute, role: "asset", offset: "0" };
        sourceKeys[source.id] = { kind: "asset", sha256: sha2 };
        continue;
      }
      modeDependent = true;
      const videoId = normalizeCutProjectVideoId(source.videoId);
      const original = await findOriginal(root, videoId);
      if (original) {
        const stat3 = await fs20.stat(original);
        const originalPath = rel(root, original);
        const sha2 = await options.hashCache.hash(originalPath, original, stat3.size, Math.round(stat3.mtimeMs));
        if (source.original?.size !== void 0 && source.original.size !== stat3.size || source.original?.sha256 && source.original.sha256 !== sha2) {
          problems.push({ code: "original-changed", message: `${originalPath} does not match the size/SHA-256 recorded in sources.json; a changed original needs a new source revision` });
        }
        inputs.sources[source.id] = { path: originalPath, file: original, role: "original", offset: "0" };
        sourceKeys[source.id] = { videoId, role: "original", sha256: sha2 };
        continue;
      }
      if (mode === "original") {
        problems.push({ code: "extension-input-missing", message: `the original of source "${source.id}" (${videoId}) is not in media/original/; load it with get_media_sources(kind original, ${videoId}) \u2192 darkmind-agent media <ticket>` });
        continue;
      }
      const { candidates } = await proxyCandidates(path18.join(root, "media", "proxy"), videoId);
      const span = (c) => c.end === null ? Number.POSITIVE_INFINITY : toNumberQ(subQ(c.end, c.offset));
      const best = [...candidates].sort((a, b) => span(b) - span(a) || toNumberQ(subQ(a.offset, b.offset)))[0];
      if (!best) {
        problems.push({ code: "extension-input-missing", message: `no proxy or original of source "${source.id}" (${videoId}) is local; load it with get_media_sources(kind proxy, ${videoId}) \u2192 darkmind-agent media <ticket>` });
        continue;
      }
      const stat2 = await fs20.stat(best.file);
      const offset = formatRationalReadable(best.offset, 9);
      const proxyPath = rel(root, best.file);
      inputs.sources[source.id] = { path: proxyPath, file: best.file, role: "proxy", offset };
      sourceKeys[source.id] = { videoId, role: "proxy", offset, sha256: await options.hashCache.hash(proxyPath, best.file, stat2.size, Math.round(stat2.mtimeMs)) };
    } else {
      const upstream = docs.extensions.find((e) => e.id === input.extensionId);
      if (!upstream) continue;
      const sha2 = options.upstream.get(input.extensionId) ?? null;
      if (!sha2) waitingFor ??= input.extensionId;
      upstreamKeys[input.extensionId] = sha2;
      inputs.extensions[input.extensionId] = { path: upstream.output.path, file: abs(root, upstream.output.path) };
    }
  }
  const program = await resolveProgram(extension.command.program, root, ctx.env);
  if (program.problem) problems.push(program.problem);
  const tools = await detectTools(extension, ctx, extensionDir);
  for (const tool of tools) {
    if (tool.status === "missing") problems.push({ code: "extension-tool-missing", message: `tool "${tool.name}" was not found${tool.name.startsWith("npm:") ? `; "darkmind-agent extensions run" installs it by itself when ${await npmInstallDir(root, extensionDir)}/package.json and package-lock.json are those of the brand pack of the installed skill \u2013 otherwise run "npm ci" in ${await npmInstallDir(root, extensionDir)} (the user's step)` : "; install it yourself (nothing is installed automatically)"}` });
    else if (tool.status === "version-mismatch") problems.push({ code: "extension-tool-version", message: `tool "${tool.name}" ${tool.version} does not satisfy ${tool.required}` });
    else if (tool.status === "unverified") warnings.push({ code: "extension-tool-unverified", message: `the version of tool "${tool.name}" cannot be checked against ${tool.required}` });
  }
  const named = namedFiles(extension);
  const code = {};
  for (const [file2, hash2] of Object.entries(fileHashes)) if (isCode(file2, artefacts, named)) code[file2] = hash2;
  for (const manifest of await packageManifests(root, [...Object.keys(code), rel(root, path18.join(extensionDir, "x"))])) {
    if (!(manifest in code)) {
      const absolute = abs(root, manifest);
      const manifestStat = await fs20.stat(absolute);
      code[manifest] = await options.hashCache.hash(manifest, absolute, manifestStat.size, Math.round(manifestStat.mtimeMs));
    }
  }
  const execution = {
    program: { declared: extension.command.program, resolved: program.resolved },
    args: extension.command.args,
    tools: tools.map(({ name, required, resolved, version, digest }) => ({ name, required, resolved, version, ...digest ? { digest } : {} })),
    code
  };
  const hash = problems.length ? null : trustHash(extension.id, execution);
  const approvals = options.approvals.approvals.filter((a) => a.extensionId === extension.id);
  const locallyApproved = hash !== null && approvals.some((a) => a.hash === hash);
  const brand = hash !== null && !locallyApproved ? await brandBlockTrust(options.brandPack, root, extension, execution) : null;
  const basis = locallyApproved ? "approval" : brand?.trusted ? "brand-pack" : null;
  const approved = basis !== null;
  const changes = approved ? [] : executionChanges(approvals[approvals.length - 1]?.execution ?? null, execution);
  const outputAbs = abs(root, extension.output.path);
  const stat = await fs20.stat(outputAbs).catch(() => null);
  const outputSha = stat?.isFile() ? await options.hashCache.hash(extension.output.path, outputAbs, stat.size, Math.round(stat.mtimeMs)) : null;
  const key = problems.length || waitingFor ? null : sha256Hex(
    canonicalJson({
      runner: EXTENSION_RUNNER_VERSION,
      definition: { ...extension, $schema: void 0 },
      files: fileHashes,
      code,
      sources: sourceKeys,
      extensions: upstreamKeys,
      program: program.resolved,
      tools: execution.tools,
      mode: modeDependent ? mode : null
    })
  );
  const record = key ? await readRecord(root, extension.id, key) : null;
  let status2;
  let reason;
  if (problems.length) {
    status2 = "blocked";
    reason = problems.map((p) => p.message).join("; ");
  } else if (waitingFor) {
    status2 = "stale";
    reason = `runs after its input extension "${waitingFor}"`;
  } else if (record && outputSha === record.sha256) {
    status2 = "current";
    reason = "output matches the cached run of this state";
  } else if (record && (await fs20.stat(path18.join(cacheDir(root, extension.id), record.cached)).catch(() => null))?.size === record.size) {
    status2 = "restorable";
    reason = "an earlier run of exactly this state is cached; it is restored without running the command";
  } else {
    status2 = "stale";
    reason = !stat ? "not rendered yet" : "definition, inputs or tools changed since the output was rendered (or it was not produced by the runner)";
  }
  return {
    id: extension.id,
    file,
    needed,
    status: status2,
    reason,
    key,
    modeDependent,
    output: { path: extension.output.path, exists: Boolean(stat), sha256: outputSha },
    trust: { hash, approved, basis, execution: problems.length ? null : execution, changes, ...brand?.reason ? { brandPack: brand.reason } : {} },
    problems,
    warnings,
    record,
    inputs
  };
}
async function validDocuments(root) {
  const validation = await validateEditProject(projectReader(root));
  if (!validation.valid || !validation.documents) {
    throw new CliError("validation-failed", `the project is invalid (${validation.counts.error} errors); run "darkmind-agent validate" and fix them first`, {
      issues: validation.issues.filter((i) => i.severity === "error").slice(0, 50)
    });
  }
  return { validation, docs: validation.documents };
}
function fileOf(docs, id2) {
  const index = docs.extensions.findIndex((e) => e.id === id2);
  return docs.project.extensions[index] ?? `${EDIT_FOLDERS.extensions}/${id2}/extension.json`;
}
async function inspectExtensions(options) {
  const { validation, docs } = await validDocuments(options.root);
  const unknown = (options.only ?? []).filter((id2) => !docs.extensions.some((e) => e.id === id2));
  if (unknown.length) throw new CliError("invalid-input", `unknown extension(s) ${unknown.join(", ")}`);
  const order = extensionExecutionOrder(docs.extensions, options.only?.length ? options.only : void 0);
  const needed = neededExtensions(docs);
  const shared = {
    hashCache: await HashCache.load(mediaHashCachePath(options.root)),
    matcher: (await loadIgnoreMatcher(options.root)).matcher,
    approvals: await loadApprovals(options.root),
    brandPack: await loadBrandPack(options.env),
    upstream: /* @__PURE__ */ new Map()
  };
  const states = [];
  for (const id2 of order) {
    const extension = docs.extensions.find((e) => e.id === id2);
    const state = await inspectOne(options, docs, extension, fileOf(docs, id2), needed.has(id2), shared);
    shared.upstream.set(id2, state.status === "current" ? state.output.sha256 : state.status === "restorable" ? state.record.sha256 : null);
    states.push(state);
  }
  return { validation, order, states };
}
function killTree(pid) {
  if (!pid) return;
  if (process.platform === "win32") {
    spawn3("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }).on("error", () => {
    });
  } else {
    try {
      process.kill(-pid, "SIGKILL");
    } catch {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
      }
    }
  }
}
function runCommand(program, args, options) {
  return new Promise((resolve, reject) => {
    if (options.signal?.aborted) {
      reject(new AbortedError());
      return;
    }
    const child = spawn3(program, args, { cwd: options.cwd, env: options.env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true, detached: process.platform !== "win32" });
    let stdout = "";
    let stderr = "";
    const tail = (text3, chunk) => (text3 + chunk).slice(-TAIL_BYTES);
    child.stdout.setEncoding("utf8").on("data", (chunk) => stdout = tail(stdout, chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk) => stderr = tail(stderr, chunk));
    let aborted = false;
    let timedOut = false;
    const onAbort = () => {
      aborted = true;
      killTree(child.pid);
    };
    options.signal?.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child.pid);
    }, options.timeoutMs);
    const done = () => {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
    };
    child.on("error", (error) => {
      done();
      reject(error);
    });
    child.on("close", (code) => {
      done();
      if (aborted) reject(new AbortedError());
      else resolve({ code, stdout, stderr, timedOut });
    });
  });
}
async function snapshot(root, matcher) {
  const { files } = await scanFolder(root, matcher);
  const outside = [`${EDIT_FOLDERS.renders}/`, `${EDIT_FOLDERS.media}/`, `${EDIT_FOLDERS.localState}/`];
  const result = /* @__PURE__ */ new Map();
  for (const f of files) {
    if (outside.some((prefix) => f.path.toLowerCase().startsWith(prefix))) continue;
    const content = f.size <= 8 * 1024 ** 2 ? (await hashFile(f.absolutePath).catch(() => ({ sha256: "?" }))).sha256 : "";
    result.set(f.path, `${f.size}:${Math.round(f.mtimeMs)}:${content}`);
  }
  return result;
}
function snapshotChanges(before, after) {
  const changed = [];
  for (const [file, value2] of after) if (before.get(file) !== value2) changed.push(before.has(file) ? `changed ${file}` : `created ${file}`);
  for (const file of before.keys()) if (!after.has(file)) changed.push(`deleted ${file}`);
  return changed;
}
async function pruneCache(dir, keep) {
  const records = [];
  for (const name of await fs20.readdir(dir).catch(() => [])) {
    if (!name.endsWith(".json")) continue;
    const record = await readJsonFile(path18.join(dir, name)).catch(() => null);
    if (record?.key) records.push({ key: record.key, createdAt: record.createdAt, cached: record.cached });
  }
  records.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
  for (const old of records.filter((r) => r.key !== keep).slice(CACHE_KEEP - 1)) {
    await fs20.rm(path18.join(dir, old.cached), { force: true });
    await fs20.rm(path18.join(dir, `${old.key}.json`), { force: true });
  }
}
var ExtensionRunError = class extends CliError {
};
async function audioDurationProblem(tools, file, frames, fps, signal) {
  const result = await tools.run(tools.ffprobe, ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=start_time,duration", "-of", "json", file], { timeoutMs: 6e4, signal });
  const stream = JSON.parse(result.stdout || "{}").streams?.[0];
  const start = Number(stream?.start_time ?? 0);
  const duration = Number(stream?.duration);
  if (!Number.isFinite(duration)) return "the audio duration cannot be read";
  const expected = frames / fps;
  const tolerance = 1 / fps + 1e-3;
  if (Math.abs(start) > tolerance) return `audio starts at ${start.toFixed(3)} s instead of 0`;
  if (Math.abs(start + duration - expected) > tolerance) return `audio lasts ${(start + duration).toFixed(3)} s, the ${frames} frames ${expected.toFixed(3)} s`;
  return null;
}
async function execute(ctx, extension, state) {
  const { root } = ctx;
  const output = abs(root, extension.output.path);
  const dir = cacheDir(root, extension.id);
  const tmp = path18.join(root, "renders", ".tmp", `ext-${extension.id}-${process.pid}-${Date.now()}`);
  await fs20.mkdir(path18.dirname(output), { recursive: true });
  await fs20.mkdir(tmp, { recursive: true });
  await fs20.rm(output, { force: true });
  const inputsFile = path18.join(tmp, "inputs.json");
  await writeJsonFile(inputsFile, {
    kind: "darkmind-extension-inputs",
    version: 1,
    extensionId: extension.id,
    // only extensions that read Dark Mind videos see the mode (it is part of their cache key, nobody else's)
    mode: state.modeDependent ? ctx.mode : null,
    projectRoot: root,
    output: { ...extension.output, file: output },
    parameters: extension.parameters ?? {},
    files: state.inputs.files,
    sources: state.inputs.sources,
    extensions: state.inputs.extensions
  });
  const env = {
    ...ctx.env,
    DARKMIND_PROJECT_ROOT: root,
    DARKMIND_EXTENSION_ID: extension.id,
    DARKMIND_EXTENSION_OUTPUT: output,
    DARKMIND_EXTENSION_INPUTS: inputsFile,
    DARKMIND_EXTENSION_TMP: tmp,
    DARKMIND_FFMPEG: ctx.tools.ffmpeg,
    DARKMIND_FFPROBE: ctx.tools.ffprobe
  };
  delete env.DARKMIND_RENDER_MODE;
  if (state.modeDependent) env.DARKMIND_RENDER_MODE = ctx.mode;
  const fail = async (code, message, keep = false) => {
    if (keep && await isFile2(output)) {
      const rejected = path18.join(dir, `rejected${path18.extname(output)}`);
      await fs20.mkdir(dir, { recursive: true });
      await fs20.rm(rejected, { force: true });
      await fs20.rename(output, rejected).catch(() => fs20.rm(output, { force: true }));
      message += ` (kept for inspection: ${rel(root, rejected)})`;
    } else await fs20.rm(output, { force: true });
    throw new ExtensionRunError(code, message);
  };
  const before = await snapshot(root, ctx.matcher);
  const started = Date.now();
  try {
    let result;
    try {
      result = await runCommand(state.trust.execution.program.resolved, extension.command.args, { cwd: root, env, signal: ctx.signal, timeoutMs: ctx.timeoutMs });
    } catch (error) {
      if (error instanceof AbortedError) {
        await fs20.rm(output, { force: true });
        throw error;
      }
      return await fail("extension-failed", `the command could not be started: ${errorMessage(error)}`);
    }
    const durationMs = Date.now() - started;
    const changes = snapshotChanges(before, await snapshot(root, ctx.matcher));
    if (changes.length) return await fail("extension-wrote-project-files", `the command changed synced project files (${changes.slice(0, 5).join(", ")}); an extension may only write its output under renders/extensions/ and temporary files to DARKMIND_EXTENSION_TMP`);
    if (result.timedOut) return await fail("extension-timeout", `the command did not finish within ${Math.round(ctx.timeoutMs / 1e3)} s and was stopped`);
    if (result.code !== 0) {
      const reason = result.stderr.trim().split(/\r?\n/).slice(-5).join(" | ") || result.stdout.trim().split(/\r?\n/).slice(-3).join(" | ") || "no output";
      return await fail("extension-failed", `the command exited with code ${result.code}: ${reason}`);
    }
    const stat = await fs20.stat(output).catch(() => null);
    if (!stat?.isFile()) return await fail("extension-output-missing", `the command succeeded but did not write ${extension.output.path}`);
    let info;
    try {
      info = await probeStreams(ctx.tools, output, { signal: ctx.signal });
    } catch (error) {
      return await fail("extension-output", `${extension.output.path} is not readable media: ${errorMessage(error)}`, true);
    }
    const fps = parseRational(extension.output.fps);
    const pts = info.video ? await probeFramePts(ctx.tools, output, { signal: ctx.signal }) : [];
    const problems = extensionContractProblems(info, extension.output, info.video ? pts.length : null);
    if (info.video && pts.length) {
      const fpsNumber = toNumberQ(fps);
      const first = toNumberQ(pts[0]);
      const bad = pts.findIndex((value2, k) => Math.abs(toNumberQ(value2) - first - k / fpsNumber) > 1 / (4 * fpsNumber));
      if (bad >= 0) problems.push(`frame ${bad} is at ${(toNumberQ(pts[bad]) - first).toFixed(4)} s instead of ${(bad / fpsNumber).toFixed(4)} s (not a constant ${extension.output.fps})`);
    }
    if (problems.length) return await fail("extension-output", `${extension.output.path} does not match the extension contract: ${problems.join(", ")} (nothing is cut or stretched)`, true);
    if (extension.output.audio && info.audio) {
      const audioProblem = await audioDurationProblem(ctx.tools, output, extension.output.durationFrames, toNumberQ(fps), ctx.signal);
      if (audioProblem) return await fail("extension-output", `${extension.output.path} does not match the extension contract: ${audioProblem} (nothing is cut or padded)`, true);
    }
    const v = info.video;
    const { sha256: sha2563, size } = await hashFile(output);
    await fs20.mkdir(dir, { recursive: true });
    const cached = `${state.key}${path18.extname(output).toLowerCase()}`;
    await fs20.copyFile(output, path18.join(dir, cached));
    const record = {
      kind: "darkmind-extension-run",
      version: 1,
      extensionId: extension.id,
      key: state.key,
      mode: state.modeDependent ? ctx.mode : null,
      output: extension.output.path,
      cached,
      sha256: sha2563,
      size,
      frames: v ? pts.length : extension.output.durationFrames,
      profile: {
        width: v?.width ?? 0,
        height: v?.height ?? 0,
        fps: extension.output.fps,
        alpha: v?.alpha ?? false,
        audio: Boolean(info.audio),
        videoCodec: v?.codec ?? "none",
        pixelFormat: v?.pixelFormat ?? "none"
      },
      trustHash: state.trust.hash,
      tools: state.trust.execution.tools,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      durationMs,
      runner: EXTENSION_RUNNER_VERSION,
      agentVersion: AGENT_VERSION
    };
    await writeJsonFile(path18.join(dir, `${state.key}.json`), record);
    await pruneCache(dir, state.key);
    return record;
  } finally {
    await fs20.rm(tmp, { recursive: true, force: true });
  }
}
async function restore(root, state) {
  const record = state.record;
  const cached = path18.join(cacheDir(root, state.id), record.cached);
  const { sha256: sha2563 } = await hashFile(cached).catch(() => ({ sha256: "" }));
  if (sha2563 !== record.sha256) return false;
  const output = abs(root, state.output.path);
  await fs20.mkdir(path18.dirname(output), { recursive: true });
  const temp = `${output}.restore-${process.pid}.tmp`;
  await fs20.copyFile(cached, temp);
  await fs20.rm(output, { force: true });
  await fs20.rename(temp, output);
  return true;
}
async function runExtensions(options) {
  const { root } = options;
  const progress = options.progress ?? (() => {
  });
  const { docs } = await validDocuments(root);
  const unknown = (options.only ?? []).filter((id2) => !docs.extensions.some((e) => e.id === id2));
  if (unknown.length) throw new CliError("invalid-input", `unknown extension(s) ${unknown.join(", ")}`);
  const needed = neededExtensions(docs);
  const order = options.neededOnly ? extensionExecutionOrder(docs.extensions, needed) : extensionExecutionOrder(docs.extensions, options.only?.length ? options.only : void 0);
  const matcher = (await loadIgnoreMatcher(root)).matcher;
  const brandPack = await loadBrandPack(options.env);
  const modules = await ensureBrandPackModules(root, brandPack, options.env, progress);
  if (modules.status === "installed") progress("extensions/: playwright-core installed");
  else if (modules.status === "failed") progress(`extensions/: ${modules.message}`);
  const shared = { hashCache: await HashCache.load(mediaHashCachePath(root)), matcher, approvals: await loadApprovals(root), brandPack, upstream: /* @__PURE__ */ new Map() };
  const results = [];
  const failed = /* @__PURE__ */ new Set();
  try {
    for (const id2 of order) {
      const extension = docs.extensions.find((e) => e.id === id2);
      const blockedBy = extension.inputs.find((input) => input.kind === "extension" && failed.has(input.extensionId));
      if (blockedBy && blockedBy.kind === "extension") {
        failed.add(id2);
        const waiting = await inspectOne(options, docs, extension, fileOf(docs, id2), needed.has(id2), shared);
        results.push({
          id: id2,
          action: "skipped",
          key: null,
          sha256: null,
          output: extension.output.path,
          problems: [{ code: "extension-input-failed", message: `input extension "${blockedBy.extensionId}" is not up to date` }, ...waiting.problems],
          ...!waiting.trust.approved && waiting.trust.hash ? { approval: { hash: waiting.trust.hash, changes: waiting.trust.changes } } : {}
        });
        continue;
      }
      const state = await inspectOne(options, docs, extension, fileOf(docs, id2), needed.has(id2), shared);
      const base = { id: id2, key: state.key, output: state.output.path };
      if (state.status === "blocked") {
        failed.add(id2);
        results.push({ ...base, action: "blocked", sha256: null, problems: state.problems });
        continue;
      }
      if (!options.force && state.status === "current") {
        shared.upstream.set(id2, state.output.sha256);
        results.push({ ...base, action: "current", sha256: state.output.sha256, problems: [] });
        continue;
      }
      if (!options.force && state.status === "restorable" && await restore(root, state)) {
        progress(`extension ${id2}: restored from the cache`);
        shared.upstream.set(id2, state.record.sha256);
        results.push({ ...base, action: "restored", sha256: state.record.sha256, problems: [] });
        continue;
      }
      if (!state.trust.approved) {
        failed.add(id2);
        results.push({
          ...base,
          action: "blocked",
          sha256: null,
          problems: [{ code: "extension-approval-required", message: `the command of extension "${id2}" is not approved in this folder (${state.trust.changes.join("; ")})${state.trust.brandPack ? `; it is no unchanged brand block: ${state.trust.brandPack}` : ""}; show it to the user with "darkmind-agent extensions show ${id2}" and approve it only after they agreed` }],
          approval: { hash: state.trust.hash, changes: state.trust.changes }
        });
        continue;
      }
      progress(`extension ${id2}: running ${extension.command.program} (${state.reason})`);
      try {
        const record = await execute({ ...options, timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS, matcher }, extension, state);
        shared.upstream.set(id2, record.sha256);
        results.push({ ...base, action: "rendered", sha256: record.sha256, durationMs: record.durationMs, problems: [] });
      } catch (error) {
        if (!(error instanceof ExtensionRunError)) throw error;
        failed.add(id2);
        results.push({ ...base, action: "failed", sha256: null, problems: [{ code: error.code, message: error.message }] });
      }
    }
  } finally {
    await shared.hashCache.save();
  }
  return { ok: failed.size === 0, mode: options.mode, results };
}
function extensionsError(summary3) {
  const bad = summary3.results.filter((r) => r.action === "blocked" || r.action === "failed" || r.action === "skipped");
  const approvals = bad.filter((r) => r.approval);
  const lines = bad.map((r) => `${r.id}: ${r.problems.map((p) => p.message).join("; ")}`);
  if (approvals.length) {
    return new CliError("extension-approval-required", `Extensions need a local approval before they run: ${lines.join(" | ")}`, {
      extensions: approvals.map((r) => ({ id: r.id, hash: r.approval.hash, changes: r.approval.changes, show: `darkmind-agent extensions show ${r.id}` })),
      results: summary3.results
    });
  }
  return new CliError("extensions-failed", `Extensions are not up to date: ${lines.join(" | ")}`, {
    issues: bad.flatMap((r) => r.problems.map((p) => ({ severity: "error", code: p.code, message: p.message, ref: r.id }))),
    results: summary3.results
  });
}

// src/pipeline/graph.ts
import { promises as fs21 } from "node:fs";
import path19 from "node:path";
var RENDER_RECIPES = {
  proxy: {
    id: "proxy-x264-veryfast-crf23-v1",
    video: ["-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-profile:v", "high", "-pix_fmt", "yuv420p"],
    audioCodec: ["-c:a", "aac", "-b:a", "192k"]
  },
  original: {
    id: "final-x264-medium-crf17-v1",
    video: ["-c:v", "libx264", "-preset", "medium", "-crf", "17", "-profile:v", "high", "-pix_fmt", "yuv420p"],
    audioCodec: ["-c:a", "aac", "-b:a", "256k"]
  }
};
var COLOR_ARGS = ["-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv"];
var COLOR_PARAMS = "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv";
var REQUIRED_FILTERS = [
  "settb",
  "setpts",
  "fps",
  "trim",
  "scale",
  "format",
  "crop",
  "setsar",
  "overlay",
  "color",
  "drawtext",
  "aresample",
  "aformat",
  "atrim",
  "asetpts",
  "volume",
  "adelay",
  "amix",
  "apad",
  "anullsrc",
  "pan",
  "psnr",
  "setparams"
];
var REQUIRED_ENCODERS = ["libx264", "aac", "pcm_s24le"];
var CAPTION_FONT_FILE = "caption-font.ttf";
function gcd2(a, b) {
  while (b) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}
var lcm = (a, b) => a / gcd2(a, b) * b;
function seekFor(t) {
  const s = floorQ(t) - 1n;
  return s > 0n ? s : 0n;
}
function clipSpan(clip, from, to) {
  const k0 = from > clip.start ? from - clip.start : 0;
  const k1 = to < clip.end ? to - clip.start : clip.frames;
  return k1 > k0 ? { k0, k1 } : null;
}
function sampleTime(clip, k0, fps) {
  return addQ(parseRational(clip.inLocal), divQ(rational(k0), fps));
}
function plainCaptionStyle(width, height) {
  const fontSize = Math.round(Math.min(width, height) * 0.05);
  return {
    fontSize,
    lineSpacing: Math.round(fontSize * 0.25),
    boxBorder: Math.round(fontSize * 0.3),
    marginBottom: Math.round(height * (height > width ? 0.16 : 0.08))
  };
}
function colorMatrix(file) {
  const signalled2 = file.video?.colorSpace && !["unknown", "unspecified", "reserved"].includes(file.video.colorSpace);
  return `in_color_matrix=${signalled2 ? "auto" : "bt709"}:out_color_matrix=bt709:in_range=auto:out_range=tv`;
}
function videoSegmentArgs(plan, from, to, options) {
  const { width: W, height: H } = plan.output;
  const fps = parseRational(plan.output.fps);
  const fpsText = fps.d === 1n ? `${fps.n}` : `${fps.n}/${fps.d}`;
  const total = to - from;
  if (total <= 0) throw new Error("empty frame range");
  const inputs = [];
  const graph = [`color=c=black:s=${W}x${H}:r=${fpsText},format=yuv420p,setsar=1[base0]`];
  let base = "base0";
  let label2 = 0;
  for (const track of plan.video) {
    for (const clip of track.clips) {
      const span = clipSpan(clip, from, to);
      if (!span) continue;
      const file = plan.files[clip.file];
      const t0 = sampleTime(clip, span.k0, fps);
      const seek = seekFor(t0);
      const delta = subQ(t0, rational(seek));
      const timeBase = parseRational(file.video.timeBase);
      const L = lcm(timeBase.d, delta.d);
      const shift = mulQ(delta, rational(L));
      const n = span.k1 - span.k0;
      const crop = clip.crop;
      inputs.push("-ss", `${seek}`, "-i", options.inputPath(file));
      const index = inputs.length / 4 - 1;
      const alpha = Boolean(clip.alpha);
      const full = alpha ? "yuva444p" : "yuv444p";
      const pix = alpha ? "yuva420p" : "yuv420p";
      const v = `v${label2++}`;
      graph.push(
        `[${index}:v]settb=1/${L},setpts=PTS-${shift.n},fps=${fpsText}:round=up,trim=start_pts=0:end_pts=${n},setpts=PTS-STARTPTS,scale=${crop.scaledWidth}:${crop.scaledHeight}:flags=bicubic:${colorMatrix(file)},format=${full},crop=${W}:${H}:${crop.offsetX}:${crop.offsetY}:exact=1,setsar=1,format=${pix},setpts=PTS+${clip.start + span.k0 - from}/(${fpsText}*TB)[${v}]`
      );
      const next = `base${label2}`;
      graph.push(`[${base}][${v}]overlay=eof_action=pass:repeatlast=0:format=auto[${next}]`);
      base = next;
    }
  }
  const files = [];
  if (options.captions) {
    const style = plainCaptionStyle(W, H);
    const draws = [];
    for (const caption of plan.captions) {
      const a = Math.max(caption.start, from) - from;
      const b = Math.min(caption.end, to) - from;
      if (b <= a) continue;
      const name = `caption-${files.length}.txt`;
      files.push({ name, content: caption.text.replace(/\r\n?/g, "\n") });
      draws.push(
        `drawtext=fontfile=${CAPTION_FONT_FILE}:textfile=${name}:expansion=none:fontsize=${style.fontSize}:fontcolor=white:line_spacing=${style.lineSpacing}:box=1:boxcolor=black@0.6:boxborderw=${style.boxBorder}:text_align=C:x=(w-text_w)/2:y=h-text_h-${style.marginBottom}:enable='between(n,${a},${b - 1})'`
      );
    }
    if (draws.length) {
      graph.push(`[${base}]${draws.join(",")}[captioned]`);
      base = "captioned";
    }
  }
  graph.push(`[${base}]trim=end_frame=${total},format=yuv420p,${COLOR_PARAMS}[vout]`);
  return {
    args: [
      "-hide_banner",
      "-nostdin",
      "-loglevel",
      "error",
      "-y",
      ...inputs,
      "-filter_complex",
      graph.join(";"),
      "-map",
      "[vout]",
      "-an",
      ...options.recipe.video,
      ...COLOR_ARGS,
      "-r",
      fpsText,
      "-fps_mode",
      "cfr",
      "-frames:v",
      String(total),
      options.out
    ],
    files,
    frames: total
  };
}
function samplesFor(frames, plan) {
  const fps = parseRational(plan.output.fps);
  return BigInt(frames) * BigInt(plan.output.sampleRate) * fps.d / fps.n;
}
function audioArgs(plan, from, to, options) {
  const fps = parseRational(plan.output.fps);
  const sr = plan.output.sampleRate;
  const inputs = [];
  const graph = [];
  const labels = [];
  const totalSamples = samplesFor(to - from, plan);
  const ducking = plan.audioMaster?.ducking && plan.audioMaster.ducking.underDialogDb > 0 ? plan.audioMaster.ducking : null;
  const dialogSpans = ducking ? duckingSpans(plan, ducking.rampSeconds) : [];
  for (const track of plan.audio) {
    for (const clip of track.clips) {
      const span = clipSpan(clip, from, to);
      if (!span) continue;
      const file = plan.files[clip.file];
      const t0 = sampleTime(clip, span.k0, fps);
      const seek = seekFor(t0);
      const p0 = roundHalfUpQ(mulQ(subQ(t0, rational(seek)), rational(sr)));
      const samples = samplesFor(span.k1, plan) - samplesFor(span.k0, plan);
      const delay = samplesFor(clip.start + span.k0 - from, plan);
      inputs.push("-ss", `${seek}`, "-i", options.inputPath(file));
      const index = inputs.length / 4 - 1;
      const label2 = `a${labels.length}`;
      const upmix = file.audio?.channels === 1 ? "pan=stereo|c0=c0|c1=c0," : "";
      const duck = ducking && track.role === "music" ? duckFilter(dialogSpans, (clip.start + span.k0) / toNumberQ(fps), Number(samples) / sr, ducking) : "";
      graph.push(
        `[${index}:a]aresample=${sr},${upmix}aformat=sample_fmts=fltp:channel_layouts=stereo,atrim=start_pts=${p0}:end_pts=${p0 + samples},asetpts=PTS-STARTPTS,volume=${clip.gainDb ?? 0}dB,${duck}adelay=delays=${delay}S:all=1[${label2}]`
      );
      labels.push(label2);
    }
  }
  if (labels.length) {
    graph.push(`${labels.map((l) => `[${l}]`).join("")}amix=inputs=${labels.length}:normalize=0:duration=longest,apad=whole_len=${totalSamples},atrim=end_sample=${totalSamples}[aout]`);
  } else {
    graph.push(`anullsrc=r=${sr}:cl=stereo,atrim=end_sample=${totalSamples}[aout]`);
  }
  return {
    args: ["-hide_banner", "-nostdin", "-loglevel", "error", "-y", ...inputs, "-filter_complex", graph.join(";"), "-map", "[aout]", "-c:a", options.float ? "pcm_f32le" : "pcm_s24le", "-ar", String(sr), "-ac", "2", options.out],
    files: [],
    frames: to - from
  };
}
function duckingSpans(plan, rampSeconds) {
  const fps = toNumberQ(parseRational(plan.output.fps));
  const spans = plan.audio.filter((track) => track.role === "dialog").flatMap((track) => track.clips.map((clip) => ({ start: clip.start / fps, end: clip.end / fps }))).sort((a, b) => a.start - b.start);
  const merged = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (last && span.start - last.end < 2 * rampSeconds) last.end = Math.max(last.end, span.end);
    else merged.push({ ...span });
  }
  return merged;
}
var num2 = (value2) => (Math.round(value2 * 1e6) / 1e6).toString();
function duckFilter(spans, t0, seconds2, ducking) {
  const r = ducking.rampSeconds;
  const relevant = spans.filter((s) => s.end + r > t0 && s.start - r < t0 + seconds2);
  if (!relevant.length) return "";
  const T = `(t+${num2(t0)})`;
  const weights = relevant.map(
    (s) => r > 0 ? `min(clip((${T}-${num2(s.start - r)})/${num2(r)},0,1),clip((${num2(s.end + r)}-${T})/${num2(r)},0,1))` : `between(${T},${num2(s.start)},${num2(s.end)})`
  );
  return `volume='pow(10,-${num2(ducking.underDialogDb)}/20*(${weights.join("+")}))':eval=frame,`;
}
async function withGraphFile(args, workDir, ffmpegMajor2, name) {
  const index = args.indexOf("-filter_complex");
  if (index < 0 || args[index + 1].length < 16e3) return args;
  const file = path19.join(workDir, `${name}.graph.txt`);
  await fs21.writeFile(file, args[index + 1]);
  const copy = [...args];
  copy.splice(index, 2, ffmpegMajor2 >= 7 ? "-/filter_complex" : "-filter_complex_script", file);
  return copy;
}

// src/pipeline/render.ts
import { promises as fs25 } from "node:fs";
import path23 from "node:path";

// src/pipeline/checks.ts
import { promises as fs22 } from "node:fs";
import path20 from "node:path";
var ANALYSIS_RATE = 8e3;
async function decodeMono(tools, file, options = {}) {
  const rate = options.rate ?? ANALYSIS_RATE;
  const args = ["-hide_banner", "-nostdin", "-loglevel", "error"];
  if (options.start !== void 0) args.push("-ss", options.start.toFixed(6));
  if (options.duration !== void 0) args.push("-t", options.duration.toFixed(6));
  args.push("-i", file, "-vn", "-map", "0:a:0", "-ac", "1", "-ar", String(rate), "-f", "f32le", "-");
  const run2 = tools.binary ?? runBinary;
  const result = await run2(tools.ffmpeg, args, { timeoutMs: 30 * 6e4, signal: options.signal, maxBytes: 2 * 1024 ** 3 });
  if (result.code !== 0) throw new Error(`ffmpeg could not decode the audio: ${result.stderr.trim().split(/\r?\n/).pop() ?? ""}`);
  const buffer = result.stdout;
  return new Float32Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length - buffer.length % 4));
}
function rms(samples, from = 0, to = samples.length) {
  let sum = 0;
  for (let i = from; i < to; i++) sum += samples[i] * samples[i];
  return to > from ? Math.sqrt(sum / (to - from)) : 0;
}
function bestLag(needle, haystack, maxLag) {
  const n = needle.length;
  let needleEnergy = 0;
  for (let i = 0; i < n; i++) needleEnergy += needle[i] * needle[i];
  let best = { lag: 0, correlation: -Infinity };
  let windowEnergy = 0;
  for (let i = 0; i < n && i < haystack.length; i++) windowEnergy += haystack[i] * haystack[i];
  for (let lag = 0; lag <= maxLag && lag + n <= haystack.length; lag++) {
    if (lag > 0) {
      const out = haystack[lag - 1];
      const inn = haystack[lag + n - 1];
      windowEnergy += inn * inn - out * out;
    }
    let dot = 0;
    for (let i = 0; i < n; i++) dot += needle[i] * haystack[lag + i];
    const denominator = Math.sqrt(needleEnergy * Math.max(windowEnergy, 1e-12));
    const correlation = denominator > 0 ? dot / denominator : 0;
    if (correlation > best.correlation) best = { lag, correlation };
  }
  return best;
}
async function syncCheck(tools, plan, renderedFile, inputPath, options = {}) {
  const fps = toNumberQ(parseRational(plan.output.fps));
  const toleranceMs = 1e3 / fps;
  const dialog = plan.audio.filter((track) => track.role === "dialog");
  const clips = (dialog.length ? dialog : plan.audio).flatMap((track) => track.clips);
  if (clips.length === 0) return { status: "skipped", toleranceMs, maxDeviationMs: null, clips: [] };
  const rendered = await decodeMono(tools, renderedFile, { signal: options.signal });
  const margin = 0.25;
  const results = [];
  for (const clip of clips) {
    const clipSeconds = clip.frames / fps;
    const length2 = Math.min(2, clipSeconds);
    const offset = Math.max(0, (clipSeconds - length2) / 2);
    const needleStart = Math.round((clip.start / fps + offset) * ANALYSIS_RATE);
    const needle = rendered.subarray(needleStart, needleStart + Math.round(length2 * ANALYSIS_RATE));
    const sourceStart = toNumberQ(parseRational(clip.inLocal)) + offset;
    const lead = Math.min(margin, sourceStart);
    let reference;
    try {
      reference = await decodeMono(tools, inputPath(clip.file), { start: sourceStart - lead, duration: length2 + lead + margin, signal: options.signal });
    } catch (error) {
      results.push({ clipId: clip.id, status: "inconclusive", deviationMs: null, correlation: null, note: errorMessage(error) });
      continue;
    }
    if (needle.length < ANALYSIS_RATE * 0.2 || rms(reference) < 10 ** (-50 / 20) || rms(needle) < 10 ** (-50 / 20)) {
      results.push({ clipId: clip.id, status: "inconclusive", deviationMs: null, correlation: null, note: "too short or silent" });
      continue;
    }
    const { lag, correlation } = bestLag(needle, reference, Math.round((lead + margin) * ANALYSIS_RATE));
    if (correlation < 0.5) {
      results.push({ clipId: clip.id, status: "inconclusive", deviationMs: null, correlation: round(correlation, 3), note: "no clear match (other tracks dominate)" });
      continue;
    }
    const deviationMs = (Math.round(lead * ANALYSIS_RATE) - lag) / ANALYSIS_RATE * 1e3;
    results.push({ clipId: clip.id, status: Math.abs(deviationMs) <= toleranceMs ? "ok" : "deviation", deviationMs: round(deviationMs, 2), correlation: round(correlation, 3) });
  }
  const measured = results.filter((r) => r.deviationMs !== null);
  const maxDeviationMs = measured.length ? Math.max(...measured.map((r) => Math.abs(r.deviationMs))) : null;
  const status2 = results.some((r) => r.status === "deviation") ? "fail" : measured.length ? "pass" : "inconclusive";
  return { status: status2, toleranceMs: round(toleranceMs, 2), maxDeviationMs: maxDeviationMs === null ? null : round(maxDeviationMs, 2), clips: results };
}
var round = (value2, digits) => Math.round(value2 * 10 ** digits) / 10 ** digits;
function toRanges(flags, fps, gap = 1) {
  const ranges = [];
  flags.forEach((flag, frame2) => {
    if (!flag) return;
    const last = ranges[ranges.length - 1];
    if (last && frame2 - last.end <= gap) last.end = frame2 + 1;
    else ranges.push({ start: frame2, end: frame2 + 1 });
  });
  const q = { n: BigInt(fps), d: 1n };
  return ranges.map((r) => ({ ...r, from: frameTimecode(r.start, q), to: frameTimecode(r.end, q) }));
}
async function psnrPerFrame(tools, current, previous, workDir, options = {}) {
  const stats = "psnr-stats.log";
  const graph = "[0:v]scale=270:-2,format=gray[a];[1:v]scale=270:-2,format=gray[b];[a][b]psnr=stats_file=" + stats + ":shortest=1";
  const result = await tools.run(tools.ffmpeg, ["-hide_banner", "-nostdin", "-loglevel", "error", "-i", current, "-i", previous, "-filter_complex", graph, "-f", "null", "-"], {
    cwd: workDir,
    timeoutMs: 60 * 6e4,
    signal: options.signal
  });
  if (result.code !== 0) throw new Error(`psnr comparison failed: ${result.stderr.trim().split(/\r?\n/).pop() ?? ""}`);
  const text3 = await fs22.readFile(path20.join(workDir, stats), "utf8");
  const values = [];
  for (const line of text3.split(/\r?\n/)) {
    const match = /psnr_y:(\S+)/.exec(line);
    if (!match) continue;
    values.push(match[1] === "inf" ? Infinity : Number(match[1]));
  }
  return values;
}
async function changeCheck(tools, current, previous, plan, workDir, options = {}) {
  const thresholdDb = options.thresholdDb ?? 40;
  const fps = toNumberQ(parseRational(plan.output.fps));
  const empty = { thresholdDb, comparedFrames: 0, video: [], audio: [], changed: [], changedFrames: 0 };
  if (!previous) return { status: "first-version", against: null, ...empty };
  const psnr = await psnrPerFrame(tools, current.file, previous.file, workDir, options);
  const compared = Math.min(current.frames, previous.frames, psnr.length);
  const videoFlags = Array.from({ length: current.frames }, (_, frame2) => frame2 >= compared || psnr[frame2] < thresholdDb);
  const [a, b] = await Promise.all([decodeMono(tools, current.file, options), decodeMono(tools, previous.file, options)]);
  const audioFlags = Array.from({ length: current.frames }, (_, frame2) => {
    const from = Math.floor(frame2 * ANALYSIS_RATE / fps);
    const to = Math.floor((frame2 + 1) * ANALYSIS_RATE / fps);
    if (frame2 >= compared || to > b.length || to > a.length) return true;
    let diff = 0;
    let level = 0;
    for (let i = from; i < to; i++) {
      const d = a[i] - b[i];
      diff += d * d;
      level = Math.max(level, a[i] * a[i], b[i] * b[i]);
    }
    const diffRms = Math.sqrt(diff / Math.max(1, to - from));
    if (diffRms < 10 ** (-50 / 20)) return false;
    return 20 * Math.log10(Math.sqrt(level) / diffRms) < 30;
  });
  const changedFlags = videoFlags.map((flag, i) => flag || audioFlags[i]);
  return {
    status: "compared",
    against: previous.label,
    thresholdDb,
    comparedFrames: compared,
    video: toRanges(videoFlags, fps),
    audio: toRanges(audioFlags, fps),
    changed: toRanges(changedFlags, fps),
    changedFrames: changedFlags.filter(Boolean).length
  };
}
function normalizeWords(text3) {
  return text3.normalize("NFKC").toLowerCase().replace(/[’`]/g, "'").split(/[^\p{L}\p{N}']+/u).map((word) => word.replace(/^'+|'+$/g, "")).filter(Boolean);
}
function parseWhisperJson(json2) {
  const data = JSON.parse(json2);
  const words = [];
  for (const segment of data.transcription ?? []) {
    const start = (segment.offsets?.from ?? 0) / 1e3;
    const end = (segment.offsets?.to ?? 0) / 1e3;
    for (const text3 of normalizeWords(segment.text ?? "")) words.push({ text: text3, start, end });
  }
  return words;
}
function alignWords(expected, recognized) {
  const n = expected.length;
  const m = recognized.length;
  if (n * m > 25e6) throw new Error("transcript too long for the word alignment");
  const cost = new Uint32Array((n + 1) * (m + 1));
  const at = (i2, j2) => i2 * (m + 1) + j2;
  for (let i2 = 0; i2 <= n; i2++) cost[at(i2, 0)] = i2;
  for (let j2 = 0; j2 <= m; j2++) cost[at(0, j2)] = j2;
  for (let i2 = 1; i2 <= n; i2++) {
    for (let j2 = 1; j2 <= m; j2++) {
      const same = expected[i2 - 1] === recognized[j2 - 1] ? 0 : 1;
      cost[at(i2, j2)] = Math.min(cost[at(i2 - 1, j2 - 1)] + same, cost[at(i2 - 1, j2)] + 1, cost[at(i2, j2 - 1)] + 1);
    }
  }
  const ops = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && cost[at(i, j)] === cost[at(i - 1, j - 1)] + (expected[i - 1] === recognized[j - 1] ? 0 : 1)) {
      ops.push({ kind: expected[i - 1] === recognized[j - 1] ? "match" : "sub", e: i - 1, r: j - 1 });
      i--;
      j--;
    } else if (i > 0 && cost[at(i, j)] === cost[at(i - 1, j)] + 1) {
      ops.push({ kind: "del", e: i - 1 });
      i--;
    } else {
      ops.push({ kind: "ins", r: j - 1 });
      j--;
    }
  }
  return ops.reverse();
}
function compareTranscript(plan, words) {
  const fpsQ = parseRational(plan.output.fps);
  const fps = toNumberQ(fpsQ);
  const captions = [...plan.captions].sort((a, b) => a.start - b.start);
  const expected = [];
  captions.forEach((caption, index) => normalizeWords(caption.text).forEach((word) => expected.push({ word, caption: index })));
  const ops = alignWords(
    expected.map((e) => e.word),
    words.map((w) => w.text)
  );
  const perCaption = captions.map(() => ({ words: 0, matched: 0, missing: [], heard: [], first: null, last: null }));
  expected.forEach((e) => perCaption[e.caption].words++);
  const uncaptioned = [];
  for (const op of ops) {
    if (op.kind === "match") {
      const entry = perCaption[expected[op.e].caption];
      entry.matched++;
      const word = words[op.r];
      entry.first ??= word;
      entry.last = word;
    } else if (op.kind === "sub") {
      const entry = perCaption[expected[op.e].caption];
      entry.missing.push(expected[op.e].word);
      entry.heard.push(words[op.r].text);
    } else if (op.kind === "del") {
      perCaption[expected[op.e].caption].missing.push(expected[op.e].word);
    } else {
      const word = words[op.r];
      const index = captions.findIndex((c) => word.start * fps >= c.start - fps * 0.3 && word.start * fps < c.end + fps * 0.3);
      if (index >= 0) perCaption[index].heard.push(word.text);
      else uncaptioned.push(word);
    }
  }
  const deviations = [];
  const timing = [];
  captions.forEach((caption, index) => {
    const entry = perCaption[index];
    const startOffsetMs = entry.first ? Math.round((caption.start / fps - entry.first.start) * 1e3) : null;
    const endOffsetMs = entry.last ? Math.round((caption.end / fps - entry.last.end) * 1e3) : null;
    timing.push({ captionId: caption.id, startOffsetMs, endOffsetMs });
    if (entry.matched < entry.words || entry.heard.length) {
      deviations.push({ captionId: caption.id, from: frameTimecode(caption.start, fpsQ), words: entry.words, matched: entry.matched, missing: entry.missing, heard: entry.heard, startOffsetMs, endOffsetMs });
    }
  });
  const matchedWords = perCaption.reduce((sum, e) => sum + e.matched, 0);
  const groups = [];
  for (const word of uncaptioned) {
    const last = groups[groups.length - 1];
    if (last && word.start - last.end < 1) {
      last.text += ` ${word.text}`;
      last.end = word.end;
    } else groups.push({ from: frameTimecode(Math.floor(word.start * fps), fpsQ), text: word.text, end: word.end });
  }
  return {
    hitRate: expected.length ? round(matchedWords / expected.length, 4) : null,
    expectedWords: expected.length,
    recognizedWords: words.length,
    matchedWords,
    deviations,
    uncaptioned: groups.map(({ from, text: text3 }) => ({ from, text: text3 })),
    timing
  };
}
async function transcriptionCheck(tools, plan, renderedFile, stt, workDir, options = {}) {
  const base = { hitRate: null, expectedWords: 0, recognizedWords: 0, matchedWords: 0, deviations: [], uncaptioned: [], timing: [] };
  if (!stt) {
    return { status: "skipped", reason: "no speech-to-text tool configured (set DARKMIND_WHISPER and DARKMIND_WHISPER_MODEL for whisper.cpp, see doc/AI_EDITING_PIPELINE.md)", ...base };
  }
  if (plan.captions.length === 0) return { status: "skipped", reason: "the project has no captions", ...base };
  try {
    const wav = "stt-input.wav";
    const extract = await tools.run(tools.ffmpeg, ["-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-i", renderedFile, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", wav], {
      cwd: workDir,
      timeoutMs: 10 * 6e4,
      signal: options.signal
    });
    if (extract.code !== 0) throw new Error(`audio extraction failed: ${extract.stderr.trim().split(/\r?\n/).pop() ?? ""}`);
    const language = plan.captionLanguage.split("-")[0];
    const run2 = await tools.run(stt.program, ["-m", stt.model, "-f", wav, "-l", language, "-oj", "-of", "stt", "-ml", "1", "-sow", "-np"], {
      cwd: workDir,
      timeoutMs: 60 * 6e4,
      signal: options.signal
    });
    if (run2.code !== 0) throw new Error(`${path20.basename(stt.program)} failed: ${(run2.stderr || run2.stdout).trim().split(/\r?\n/).pop() ?? `exit ${run2.code}`}`);
    const words = parseWhisperJson(await fs22.readFile(path20.join(workDir, "stt.json"), "utf8"));
    return { status: "compared", tool: `whisper.cpp ${path20.basename(stt.model)}`, ...compareTranscript(plan, words), words };
  } catch (error) {
    if (error.name === "AbortedError") throw error;
    return { status: "failed", reason: errorMessage(error), ...base };
  }
}

// src/pipeline/loudness.ts
var AUDIO_MASTER_VERSION = "p6wp7-3";
var TRUE_PEAK_HEADROOM_DB = 1;
var LIMITER_HEADROOM_DB = 2;
var DIALOG_BELOW_TARGET_DB = 2;
var DIALOG_GAIN_LIMITS = { min: -12, max: 36 };
var SILENCE_LUFS = -70;
var fixed = (value2) => (Number.isFinite(value2) ? value2 : value2 > 0 ? 99 : -99).toFixed(2);
var value = (text3) => text3 === void 0 ? Number.NaN : text3 === "-inf" ? Number.NEGATIVE_INFINITY : text3 === "inf" ? Number.POSITIVE_INFINITY : Number(text3);
async function ffmpeg(tools, args, signal) {
  const result = await tools.run(tools.ffmpeg, ["-hide_banner", "-nostdin", "-loglevel", "info", ...args], { timeoutMs: 6 * 60 * 6e4, signal });
  if (result.code !== 0) throw new CliError("loudness-failed", `ffmpeg failed: ${result.stderr.trim().split(/\r?\n/).slice(-3).join(" | ")}`);
  return result.stderr;
}
async function measureLoudness(tools, file, options = {}) {
  const range2 = options.range ? ["-ss", options.range.from.toFixed(6), "-t", options.range.seconds.toFixed(6)] : [];
  const stderr = await ffmpeg(tools, ["-nostats", ...range2, "-i", file, "-map", "0:a:0", "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"], options.signal);
  const summary3 = stderr.slice(stderr.lastIndexOf("Summary:"));
  const read = (pattern) => {
    const match = pattern.exec(summary3);
    return match ? value(match[1]) : Number.NaN;
  };
  return { integratedLufs: read(/I:\s+(-?[\d.]+|-inf) LUFS/), truePeakDbtp: read(/Peak:\s+(-?[\d.]+|-inf) dBFS/), lra: read(/LRA:\s+(-?[\d.]+) LU/), threshold: read(/Threshold:\s+(-?[\d.]+|-inf) LUFS/) };
}
var dbToLinear = (db) => 10 ** (db / 20);
async function masterAudio(tools, input, output, master, options) {
  const measured = await measureLoudness(tools, input, options);
  const sr = options.sampleRate;
  const exact2 = `aresample=${sr},aformat=sample_fmts=s32:channel_layouts=stereo,apad=whole_len=${options.samples},atrim=end_sample=${options.samples}`;
  const encode = (file) => ["-c:a", "pcm_s24le", "-ar", String(sr), "-ac", "2", "-fflags", "+bitexact", "-flags:a", "+bitexact", "-map_metadata", "-1", "-y", file];
  if (!Number.isFinite(measured.integratedLufs) || measured.integratedLufs < SILENCE_LUFS) {
    await ffmpeg(tools, ["-i", input, "-map", "0:a:0", "-af", exact2, ...encode(output)], options.signal);
    return { target: master, input: measured, normalization: "none", correctionDb: 0, output: null };
  }
  const round4 = (db) => Math.round(db * 100) / 100;
  let gain = round4(master.integratedLufs - measured.integratedLufs);
  const linear = measured.truePeakDbtp + gain <= master.truePeakDbtp - TRUE_PEAK_HEADROOM_DB;
  const ceiling = master.truePeakDbtp - LIMITER_HEADROOM_DB;
  const chain = (db) => linear ? `volume=${db}dB:precision=double,${exact2}` : `volume=${db}dB:precision=double,aresample=${4 * sr},alimiter=limit=${dbToLinear(ceiling).toFixed(6)}:attack=5:release=50:level=0:latency=1,aresample=${sr},${exact2}`;
  await ffmpeg(tools, ["-i", input, "-map", "0:a:0", "-af", chain(gain), ...encode(output)], options.signal);
  let after = await measureLoudness(tools, output, options);
  let correction = 0;
  if (!linear && Number.isFinite(after.integratedLufs) && Math.abs(master.integratedLufs - after.integratedLufs) >= 0.2) {
    correction = round4(master.integratedLufs - after.integratedLufs);
    gain = round4(gain + correction);
    await ffmpeg(tools, ["-i", input, "-map", "0:a:0", "-af", chain(gain), ...encode(output)], options.signal);
    after = await measureLoudness(tools, output, options);
  }
  return {
    target: master,
    input: measured,
    normalization: linear ? "linear" : "limited",
    correctionDb: correction,
    output: { integratedLufs: after.integratedLufs, truePeakDbtp: after.truePeakDbtp }
  };
}
function loudnessCheck(measured, master) {
  const problems = [];
  const deviation = measured.integratedLufs - master.integratedLufs;
  if (!Number.isFinite(deviation) || Math.abs(deviation) > master.toleranceLu + 1e-9) {
    problems.push(`integrated loudness ${fixed(measured.integratedLufs)} LUFS, target ${master.integratedLufs} \xB1${master.toleranceLu} LU`);
  }
  if (!(measured.truePeakDbtp <= master.truePeakDbtp + 1e-9)) problems.push(`true peak ${fixed(measured.truePeakDbtp)} dBTP above ${master.truePeakDbtp} dBTP`);
  return {
    status: problems.length ? "fail" : "pass",
    target: { integratedLufs: master.integratedLufs, toleranceLu: master.toleranceLu, truePeakDbtp: master.truePeakDbtp },
    measured: { integratedLufs: measured.integratedLufs, truePeakDbtp: measured.truePeakDbtp, lra: measured.lra },
    problems
  };
}
function dialogGain(measuredLufs, referenceLufs) {
  if (!Number.isFinite(measuredLufs) || measuredLufs < SILENCE_LUFS) return null;
  const gain = Math.round((referenceLufs - measuredLufs) * 2) / 2;
  return Math.min(DIALOG_GAIN_LIMITS.max, Math.max(DIALOG_GAIN_LIMITS.min, gain)) || 0;
}

// src/pipeline/review.ts
import { promises as fs23 } from "node:fs";
import path21 from "node:path";
var REVIEWS_DIR = EDIT_FOLDERS.reviews;
var MIN_HASH_PREFIX = 12;
var hashOf = (value2) => sha256Hex(canonicalJson(value2));
var toPosix = (value2) => value2.split(path21.sep).join("/");
async function loadReviewRecords(root) {
  const dir = path21.join(root, REVIEWS_DIR);
  const names = (await fs23.readdir(dir).catch(() => [])).filter((name) => name.toLowerCase().endsWith(".json")).sort();
  const records = [];
  const problems = [];
  for (const name of names) {
    const file = `${REVIEWS_DIR}/${name}`;
    let value2;
    try {
      value2 = JSON.parse((await fs23.readFile(path21.join(dir, name), "utf8")).replace(/^\uFEFF/, ""));
    } catch (error) {
      problems.push({ file, code: "review-record-invalid", message: `is not valid JSON (${error.message}); the record is ignored` });
      continue;
    }
    const parsed = editReviewRecordSchema.safeParse(value2);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      problems.push({ file, code: "review-record-invalid", message: `is not a review record of format v1 (${issue.path.join(".") || "record"}: ${issue.message}); the record is ignored` });
      continue;
    }
    if (hashOf(parsed.data.snapshot) !== parsed.data.hash) {
      problems.push({ file, code: "review-hash-mismatch", message: "its hash does not match the reviewed snapshot (edited by hand?); the record is ignored and approves nothing" });
      continue;
    }
    records.push({ file, record: parsed.data });
  }
  records.sort((a, b) => a.record.createdAt < b.record.createdAt ? -1 : a.record.createdAt > b.record.createdAt ? 1 : a.file < b.file ? -1 : a.file > b.file ? 1 : 0);
  return { records, problems };
}
async function renderReports(root, dir) {
  const names = await fs23.readdir(path21.join(root, "renders", dir)).catch(() => []);
  return names.filter((name) => /^v\d{4,}\.json$/.test(name)).sort((a, b) => Number(b.slice(1, -5)) - Number(a.slice(1, -5))).map((name) => `renders/${dir}/${name}`);
}
async function readReport(root, rel3) {
  const report = await readJsonFile(path21.join(root, ...rel3.split("/"))).catch(() => null);
  return report?.kind === "darkmind-render-report" ? report : null;
}
function resolveReportPath(root, value2) {
  const abs2 = path21.resolve(root, value2);
  const rel3 = toPosix(path21.relative(root, abs2));
  if (rel3.startsWith("..") || path21.isAbsolute(rel3)) throw new CliError("invalid-input", `--render ${value2} is not inside the project folder`);
  return rel3.toLowerCase().endsWith(".mp4") ? `${rel3.slice(0, -4)}.json` : rel3;
}
async function checkRender(root, state, rel3, mode) {
  const report = await readReport(root, rel3);
  const problems = [];
  const warnings = [];
  if (!report) return { file: rel3, report: null, problems: [`${rel3} is not a render report`], warnings };
  if (report.mode !== mode) problems.push(`${rel3} is a ${report.mode} render, not a ${mode} render`);
  if (report.section) problems.push(`${rel3} is a section render; only complete renders can be reviewed`);
  const bindings = report.review?.bindings;
  if (!bindings) problems.push(`${rel3} was rendered before review bindings existed; render again`);
  else if (bindings.preview !== state.hashes.preview) problems.push(`${rel3} shows an older state of the project (render again and show the new ${mode === "proxy" ? "preview" : "final output"})`);
  if (state.projections.captionsText && !report.captions) problems.push(`${rel3} was rendered without visible captions (--no-captions, or a brand caption style without its caption block on the timeline); the review needs the visible captions`);
  if (report.checks?.sync?.status === "skipped" && report.checks.sync.reason === "checks disabled") {
    problems.push(`${rel3} was rendered without checks (--no-checks); the review needs the check results`);
  }
  if (report.checks?.sync?.status === "fail") warnings.push(`sync check failed (max ${report.checks.sync.maxDeviationMs ?? "?"} ms)`);
  const loudness = report.checks?.loudness;
  if (loudness?.status === "fail" && "problems" in loudness) warnings.push(`loudness check failed: ${loudness.problems.join("; ")}`);
  const output = path21.join(root, ...report.output.split("/"));
  if (!await fs23.stat(output).catch(() => null)) problems.push(`${report.output} does not exist (anymore)`);
  else if ((await hashFile(output)).sha256 !== report.sha256) problems.push(`${report.output} differs from its report (SHA-256); render again`);
  return { file: rel3, report, problems, warnings };
}
var EDITORIAL_PENDING = /* @__PURE__ */ new Set(["source-missing", "range-unresolved", "quote-missing", "context-missing"]);
async function extensionFileHashes(root, validation) {
  const result = {};
  for (const extension of validation.documents?.extensions ?? []) {
    for (const input of extension.inputs) {
      if (input.kind !== "file" || input.path in result) continue;
      const abs2 = path21.join(root, ...input.path.split("/"));
      result[input.path] = (await fs23.stat(abs2).catch(() => null))?.isFile() ? (await hashFile(abs2)).sha256 : null;
    }
  }
  return result;
}
async function fileToolchain(root, validation) {
  const rel3 = validation.documents?.project.artifacts.toolchain ?? EDIT_DEFAULT_FILES.toolchain;
  const document = await readJsonFile(path21.join(root, ...rel3.split("/"))).catch(() => null);
  return toolchainBinding(document);
}
function decide(subject, hash, records, diff) {
  const own = records.filter((r) => r.record.subject === subject);
  const decisive = hash ? own.filter((r) => r.record.hash === hash).at(-1) : void 0;
  if (decisive) return { status: decisive.record.decision === "approved" ? "approved" : "changes-requested", record: decisive.file, approvedRecord: null, changes: [] };
  const approved = own.filter((r) => r.record.decision === "approved").at(-1);
  if (!approved) return { status: "missing", record: null, approvedRecord: null, changes: [] };
  return { status: "stale", record: null, approvedRecord: approved.file, changes: diff(approved.record.snapshot) };
}
async function computeReviewState(root, options = {}) {
  const validation = options.validation ?? await validateEditProject(projectReader(root));
  const documents = validation.documents;
  const { records, problems } = await loadReviewRecords(root);
  const editorial = documents ? editorialProjection(documents) : null;
  const captionsText2 = documents ? captionsTextProjection(documents) : null;
  const editorialHash = editorial ? hashOf(editorial) : null;
  const captionsHash = captionsText2 ? hashOf(captionsText2) : null;
  const recorded = await fileToolchain(root, validation);
  const toolchain = options.toolchain ? { ffmpeg: null, captionFont: null, ...recorded, ...options.toolchain } : recorded;
  const fileHashes = await extensionFileHashes(root, validation);
  const preview = documents && editorialHash ? previewProjection(documents, { editorial: editorialHash, captionsText: captionsHash, files: fileHashes, toolchain }) : null;
  const previewHash = preview ? hashOf(preview) : null;
  const thumbnail = documents ? thumbnailProjection(documents, { files: fileHashes }) : null;
  const thumbnailHash = thumbnail ? hashOf(thumbnail) : null;
  const duration = documents ? durationExceptionProjection(documents, validation.totalFrames, previewHash) : null;
  const durationHash = duration ? hashOf(duration) : null;
  const mismatches = documents ? timelineDraftMismatches(documents) : [];
  const files = documents ? /* @__PURE__ */ new Set([EDIT_DEFAULT_FILES.project, documents.project.artifacts.sources, documents.project.artifacts.edit]) : /* @__PURE__ */ new Set();
  const errorsIn = (names) => validation.issues.filter((i) => i.severity === "error" && names.has(i.file));
  const pendingNotToolchain = validation.issues.filter((i) => i.severity === "pending" && i.code !== "toolchain-missing");
  const subject = (name, init) => ({
    subject: name,
    status: "not-reviewable",
    hash: null,
    record: null,
    approvedRecord: null,
    changes: [],
    blockers: [],
    ...init
  });
  const editorialBlockers = [
    ...errorsIn(files).map((i) => `${i.file} ${i.path}: ${i.message} [${i.code}]`),
    ...validation.issues.filter((i) => i.severity === "pending" && documents && i.file === documents.project.artifacts.edit && (EDITORIAL_PENDING.has(i.code) || i.code.startsWith("unresolved-"))).map((i) => `${i.ref ?? i.path}: ${i.message} [${i.code}]`)
  ];
  const editorialState = editorial ? subject("editorial", {
    hash: editorialHash,
    blockers: editorialBlockers,
    ...decide("editorial", editorialHash, records, (approved) => diffEditorial(approved, editorial))
  }) : subject("editorial", { blockers: ["edit.json is missing or invalid"] });
  const captionsFile = documents?.project.artifacts.captions;
  const captionsState = !documents ? subject("captions-text", { blockers: ["project.json is missing or invalid"] }) : !captionsText2 ? subject("captions-text", { status: documents.captions ? "not-required" : "not-reviewable", blockers: documents.captions ? [] : ["captions.json is missing or invalid"], note: documents.captions ? "no captions" : void 0 }) : subject("captions-text", {
    hash: captionsHash,
    blockers: errorsIn(/* @__PURE__ */ new Set([captionsFile])).map((i) => `${i.file} ${i.path}: ${i.message} [${i.code}]`),
    ...decide("captions-text", captionsHash, records, (approved) => diffCaptionsText(approved, captionsText2))
  });
  const previewBlockers = [
    ...validation.valid ? [] : [`the project has ${validation.counts.error} errors (darkmind-agent validate)`],
    ...pendingNotToolchain.length ? [`${pendingNotToolchain.length} points are pending (${[...new Set(pendingNotToolchain.map((i) => i.code))].join(", ")})`] : [],
    ...mismatches.map((m) => m.message)
  ];
  const previewState = preview ? subject("preview", { hash: previewHash, blockers: previewBlockers, ...decide("preview", previewHash, records, (approved) => diffProjections(approved, preview)) }) : subject("preview", { blockers: [documents?.timeline ? "edit.json is missing or invalid" : "timeline.json is missing or invalid"] });
  const durationState = duration ? subject("duration-exception", {
    hash: durationHash,
    note: `${duration.seconds} s (${duration.frames} frames) is outside the duration frame ${duration.minSeconds}\u2013${duration.maxSeconds} s`,
    ...decide("duration-exception", durationHash, records, (approved) => diffProjections(approved, duration))
  }) : subject("duration-exception", { status: preview ? "not-required" : "not-reviewable", note: preview ? "length inside the duration frame" : void 0 });
  let latestFinal = null;
  for (const file of await renderReports(root, "final")) {
    const report = await readReport(root, file);
    if (report) {
      latestFinal = { file, report };
      break;
    }
  }
  let finalState;
  const finalRecords = records.filter((r) => r.record.subject === "final");
  if (latestFinal?.report.review?.bindings?.preview && latestFinal.report.review.bindings.editorial) {
    const { report } = latestFinal;
    const bindings = report.review.bindings;
    const projection = finalProjection(report, { preview: bindings.preview, editorial: bindings.editorial, captionsText: bindings.captionsText });
    const hash = hashOf(projection);
    const decided = decide("final", hash, records, (approved) => diffProjections(approved, projection));
    finalState = subject("final", {
      hash,
      ...decided,
      ...bindings.preview !== previewHash ? { status: "stale", blockers: [`${report.output} shows an older state of the project; render the final output again`] } : {},
      note: `latest final output ${report.output}`
    });
  } else {
    const approvedElsewhere = finalRecords.filter((r) => r.record.decision === "approved" && r.record.snapshot.preview === previewHash).at(-1);
    finalState = approvedElsewhere ? subject("final", { status: "approved", hash: approvedElsewhere.record.hash, record: approvedElsewhere.file, note: `approved output ${approvedElsewhere.record.snapshot.output} is not present in this folder (renders are not synced)` }) : subject("final", { blockers: [latestFinal ? `${latestFinal.file} was rendered before review bindings existed; render again` : "no final render yet (darkmind-agent render --original)"] });
  }
  const thumbnailState = !documents ? subject("thumbnail", { blockers: ["project.json is missing or invalid"] }) : !thumbnail ? subject("thumbnail", { status: "not-required", note: "no still-image extension (thumbnail)" }) : subject("thumbnail", {
    hash: thumbnailHash,
    blockers: validation.valid ? [] : [`the project has ${validation.counts.error} errors (darkmind-agent validate)`],
    note: `still images: ${Object.keys(thumbnail.stills).join(", ")}`,
    ...decide("thumbnail", thumbnailHash, records, (approved) => diffProjections(approved, thumbnail))
  });
  return {
    validation,
    recipe: Boolean(documents?.project.recipe),
    projections: { editorial, captionsText: captionsText2, preview, duration, thumbnail },
    hashes: { editorial: editorialHash, captionsText: captionsHash, preview: previewHash, duration: durationHash, thumbnail: thumbnailHash },
    mismatches,
    records,
    problems,
    subjects: { editorial: editorialState, "captions-text": captionsState, preview: previewState, "duration-exception": durationState, final: finalState, thumbnail: thumbnailState },
    latestFinal
  };
}
function reviewBindings(state) {
  return { editorial: state.hashes.editorial, captionsText: state.hashes.captionsText, preview: state.hashes.preview, totalFrames: state.validation.totalFrames };
}
var SUBJECT_LABEL = {
  editorial: "editorial review (statements, sources, ranges, order)",
  "captions-text": "caption text review",
  preview: "preview review",
  "duration-exception": "duration exception",
  final: "final approval",
  thumbnail: "thumbnail review (frame and headline of the still images)"
};
function describeMissing(state) {
  const show2 = `darkmind-agent review show ${state.subject}`;
  switch (state.status) {
    case "stale":
      return `the ${SUBJECT_LABEL[state.subject]} is out of date: ${state.changes.length} change(s) since ${state.approvedRecord}; show the changes to the editor (${show2}) and record the editor's decision`;
    case "changes-requested":
      return `the editor requested changes in ${state.record} (${SUBJECT_LABEL[state.subject]}); change the project and show it again`;
    case "not-reviewable":
      return `the ${SUBJECT_LABEL[state.subject]} is not possible yet: ${state.blockers.join("; ")}`;
    default:
      return `the ${SUBJECT_LABEL[state.subject]} is missing; show it to the editor (${show2}) and record the editor's decision`;
  }
}
function evaluateGate(state, action) {
  const blockers = [];
  const approvals = [];
  const notes = [];
  const { validation } = state;
  if (!validation.valid) blockers.push({ code: "project-invalid", message: `the project has ${validation.counts.error} errors; run "darkmind-agent validate"` });
  if (action === "still-original") {
    const subject = state.subjects.thumbnail;
    if (subject.status === "approved") {
      if (subject.record) approvals.push(subject.record);
    } else if (subject.status !== "not-required") blockers.push({ code: `review-${subject.status}`, subject: "thumbnail", message: describeMissing(subject) });
    return { action, status: blockers.length ? "blocked" : "passed", basis: "reviews", blockers, approvals, notes };
  }
  const pending = validation.issues.filter((i) => i.severity === "pending" && i.code !== "toolchain-missing");
  if (action === "render-proxy-section") {
    if (pending.length) notes.push(`${pending.length} points are still pending; a section render is no reviewable preview`);
    return { action, status: blockers.length ? "blocked" : "passed", basis: "section", blockers, approvals, notes };
  }
  if (pending.length) {
    blockers.push({ code: "project-not-ready", message: `${pending.length} points are pending (${[...new Set(pending.map((i) => i.code))].join(", ")}); resolve them first (darkmind-agent validate --ready)` });
  }
  for (const mismatch of state.mismatches) blockers.push({ code: "timeline-draft-mismatch", subject: "editorial", message: `timeline differs from the draft: ${mismatch.message}` });
  const need = (name) => {
    const subject = state.subjects[name];
    if (subject.status === "not-required") return;
    if (subject.status === "approved") {
      if (subject.record) approvals.push(subject.record);
      return;
    }
    blockers.push({ code: `review-${subject.status}`, subject: name, message: describeMissing(subject) });
  };
  let basis = "reviews";
  if (action === "render-proxy") {
    if (state.recipe && state.subjects.editorial.status !== "approved") {
      basis = "recipe-first-pass";
      notes.push("format recipe: the first pass runs to the proxy preview; the editor approves the content when reviewing the preview (F5), before the final render");
    } else need("editorial");
  } else {
    need("editorial");
    need("captions-text");
    need("preview");
    need("duration-exception");
    for (const issue of validation.issues.filter((i) => i.code === "rights-missing" || i.code === "rights-unclear")) {
      blockers.push({ code: issue.code, message: `source "${issue.ref ?? "?"}": ${issue.message}` });
    }
  }
  return { action, status: blockers.length ? "blocked" : "passed", basis, blockers, approvals, notes };
}
function gateError(gate) {
  const what = { "render-proxy": "The proxy preview", "render-proxy-section": "The section render", "render-original": "The final render", export: "The export", "still-original": "The thumbnail from the original" }[gate.action];
  return new CliError(
    "review-required",
    [`${what} needs approvals that are missing:`, ...gate.blockers.map((b) => `  - ${b.message}`), "Approvals are recorded only after the editor explicitly confirms them (darkmind-agent review approve)."].join("\n"),
    { gate }
  );
}
async function requireReviewGate(root, action, options = {}) {
  const state = await computeReviewState(root, options);
  const gate = evaluateGate(state, action);
  if (gate.status === "blocked") throw gateError(gate);
  return { gate, state };
}
async function stillRenders(root, state, tools, env) {
  const ids = stillImageExtensions(state.validation.documents?.extensions ?? []).map((e) => e.id);
  if (!ids.length || !state.validation.valid) return [];
  const result = /* @__PURE__ */ new Map();
  for (const mode of ["proxy", "original"]) {
    const inspection = await inspectExtensions({ root, mode, tools, env, only: ids });
    for (const s of inspection.states.filter((x) => ids.includes(x.id))) {
      if (result.get(s.id)?.current) continue;
      if (s.status === "current") result.set(s.id, { id: s.id, output: s.output.path, current: true, mode, sha256: s.output.sha256, reason: s.reason });
      else if (!result.has(s.id)) result.set(s.id, { id: s.id, output: s.output.path, current: false, mode: null, sha256: s.output.sha256, reason: s.reason });
    }
  }
  return ids.map((id2) => result.get(id2)).filter(Boolean);
}
async function reviewTarget(root, state, subject, options = {}) {
  const current = state.subjects[subject];
  const blockers = [...current.blockers];
  const warnings = [];
  const projection = {
    editorial: state.projections.editorial,
    "captions-text": state.projections.captionsText,
    preview: state.projections.preview,
    "duration-exception": state.projections.duration,
    final: null,
    thumbnail: state.projections.thumbnail
  }[subject];
  if (subject === "duration-exception" && !projection && state.projections.preview) {
    throw new CliError("not-required", "The timeline length is inside the duration frame of project.json; no exception is needed.");
  }
  if (subject === "captions-text" && current.status === "not-required") throw new CliError("not-required", "The project has no captions; there is no caption text to review.");
  if (subject === "thumbnail") {
    if (current.status === "not-required") throw new CliError("not-required", "The project has no still-image extension (thumbnail); there is nothing to review.");
    if (!options.stills) blockers.push("the render state of the still images is unknown");
    else {
      for (const id2 of Object.keys(state.projections.thumbnail?.stills ?? {})) {
        const still = options.stills.find((s) => s.id === id2);
        if (!still?.current) blockers.push(`${still?.output ?? id2} does not show the current state (${still?.reason ?? "not inspected"}); render it (darkmind-agent extensions run ${id2}) and show the image to the editor`);
        const definition = state.projections.thumbnail.stills[id2].definition;
        if (definition.parameters?.candidates !== void 0) blockers.push(`${id2} shows candidates to choose from, not the thumbnail: set the frame the editor chose (parameters.frame), render it and show it again`);
      }
    }
  }
  let render = null;
  if (subject === "preview" || subject === "final") {
    const mode = subject === "preview" ? "proxy" : "original";
    let rel3 = options.render ? resolveReportPath(root, options.render) : null;
    if (!rel3) {
      const reports = await renderReports(root, subject === "preview" ? "proxy" : "final");
      for (const file of reports) {
        const report = await readReport(root, file);
        if (report?.review?.bindings?.preview && report.review.bindings.preview === state.hashes.preview) {
          rel3 = file;
          break;
        }
      }
      rel3 ??= reports[0] ?? null;
    }
    render = rel3 ? await checkRender(root, state, rel3, mode) : null;
    if (!render) blockers.push(`no ${mode} render yet (darkmind-agent render --${mode})`);
    else {
      blockers.push(...render.problems);
      warnings.push(...render.warnings);
    }
    if (subject === "final") {
      const report = render?.report;
      if (report && report.review?.gate?.status !== "passed") blockers.push(`${render.file} was not rendered through the review gate`);
      for (const name of ["editorial", "captions-text", "preview", "duration-exception"]) {
        const status2 = state.subjects[name].status;
        if (status2 !== "approved" && status2 !== "not-required") blockers.push(`the ${SUBJECT_LABEL[name]} is ${status2}`);
      }
      if (!report?.review?.bindings?.preview || !report.review.bindings.editorial || !state.hashes.preview) {
        return { subject, hash: "", snapshot: {}, render, blockers: blockers.length ? blockers : ["no reviewable final render"], warnings };
      }
      const bindings = report.review.bindings;
      const snapshot2 = finalProjection(report, { preview: bindings.preview, editorial: bindings.editorial, captionsText: bindings.captionsText });
      return { subject, hash: hashOf(snapshot2), snapshot: snapshot2, render, blockers, warnings };
    }
  }
  if (!projection || !current.hash) throw new CliError("not-reviewable", `Nothing to review for ${subject}: ${current.blockers.join("; ") || "the project is incomplete"}`);
  return { subject, hash: current.hash, snapshot: projection, render, blockers, warnings };
}
async function recordReview(root, options) {
  if (!EDIT_REVIEW_SUBJECTS.includes(options.subject)) throw new CliError("usage", `unknown review subject "${options.subject}" (${EDIT_REVIEW_SUBJECTS.join(", ")})`);
  const reviewer = options.reviewer?.trim();
  if (!reviewer) throw new CliError("usage", "--by <name of the editor> is required: a review records who decided");
  const statement = options.confirmation.statement?.trim() || null;
  if (options.confirmation.method === "relayed" && !statement) {
    throw new CliError("confirmation-required", "--confirmation must contain the editor's explicit confirmation verbatim; the agent never approves on its own");
  }
  const comment = options.comment?.trim() || null;
  if (options.decision === "changes-requested" && !comment) throw new CliError("usage", "--comment is required when the editor requests changes (what should change)");
  const state = await computeReviewState(root);
  const target = await reviewTarget(root, state, options.subject, { render: options.render, stills: options.stills });
  const wanted = (options.hash ?? "").trim().toLowerCase();
  if (wanted.length < MIN_HASH_PREFIX || !/^[0-9a-f]+$/.test(wanted)) {
    throw new CliError("usage", `--hash must be the hash shown by "darkmind-agent review show ${options.subject}" (at least ${MIN_HASH_PREFIX} hex characters)`);
  }
  if (!target.hash || !target.hash.startsWith(wanted)) {
    throw new CliError(
      "hash-mismatch",
      `The ${options.subject} state changed since it was shown (current hash ${target.hash ? target.hash.slice(0, 16) : "none"}); run "darkmind-agent review show ${options.subject}" again and let the editor review the current state.`
    );
  }
  if (options.decision === "approved" && target.blockers.length) {
    throw new CliError("review-not-possible", [`The ${options.subject} cannot be approved yet:`, ...target.blockers.map((b) => `  - ${b}`)].join("\n"), { blockers: target.blockers });
  }
  const now = options.now?.() ?? /* @__PURE__ */ new Date();
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(".", "");
  const report = target.render?.report;
  const record = {
    schemaVersion: 1,
    kind: "darkmind-review",
    id: `r-${stamp.toLowerCase()}-${options.subject}`.slice(0, 64),
    subject: options.subject,
    decision: options.decision,
    hash: target.hash,
    snapshot: target.snapshot,
    render: report && target.render && !target.render.problems.length ? { report: target.render.file, output: report.output, sha256: report.sha256, mode: report.mode, renderKey: report.renderKey, frames: report.frames } : null,
    reviewer: { name: reviewer },
    confirmation: { method: options.confirmation.method, statement },
    comment,
    createdAt: now.toISOString(),
    tool: { name: "darkmind-agent", version: AGENT_VERSION }
  };
  const parsed = editReviewRecordSchema.safeParse(record);
  if (!parsed.success) throw new CliError("internal-error", `review record does not match its schema: ${parsed.error.issues[0]?.message}`);
  const base = `${stamp}-${options.subject}-${target.hash.slice(0, 12)}`;
  let name = `${base}.json`;
  for (let n = 2; await fs23.stat(path21.join(root, REVIEWS_DIR, name)).catch(() => null); n++) name = `${base}-${n}.json`;
  await writeFileAtomic(path21.join(root, REVIEWS_DIR, name), `${JSON.stringify(record, null, 2)}
`);
  return { file: `${REVIEWS_DIR}/${name}`, record, target };
}

// src/pipeline/toolchain.ts
import { promises as fs24 } from "node:fs";
import path22 from "node:path";
function ffmpegMajor(version) {
  const match = /(?:version\s+)?n?(\d+)\.\d+/.exec(version);
  return match ? Number(match[1]) : 0;
}
function listed(output, name) {
  return new RegExp(`^\\s*\\S+\\s+${name}\\s`, "m").test(output);
}
function defaultFont(env) {
  if (env.DARKMIND_FONT) return [env.DARKMIND_FONT];
  if (process.platform === "win32") return ["C:\\Windows\\Fonts\\arial.ttf", "C:\\Windows\\Fonts\\segoeui.ttf"];
  if (process.platform === "darwin") return ["/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf"];
  return ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf", "/usr/share/fonts/TTF/DejaVuSans.ttf"];
}
function sttConfig(env) {
  return env.DARKMIND_WHISPER && env.DARKMIND_WHISPER_MODEL ? { program: env.DARKMIND_WHISPER, model: env.DARKMIND_WHISPER_MODEL } : null;
}
async function detectToolchain(tools, env, options) {
  const problems = [];
  const [ffmpeg2, ffprobe] = await Promise.all([toolVersion(tools, "ffmpeg"), toolVersion(tools, "ffprobe")]);
  if (!ffmpeg2 || !ffprobe) {
    problems.push({ code: "ffmpeg-missing", message: "ffmpeg and ffprobe are required for rendering; install ffmpeg (in PATH) or set DARKMIND_FFMPEG/DARKMIND_FFPROBE (nothing is installed automatically)" });
    return { toolchain: null, problems };
  }
  const [filtersOut, encodersOut] = await Promise.all([
    tools.run(tools.ffmpeg, ["-hide_banner", "-filters"], { timeoutMs: 3e4 }),
    tools.run(tools.ffmpeg, ["-hide_banner", "-encoders"], { timeoutMs: 3e4 })
  ]);
  const missingFilters = REQUIRED_FILTERS.filter((name) => !listed(filtersOut.stdout, name));
  const missingEncoders = REQUIRED_ENCODERS.filter((name) => !listed(encodersOut.stdout, name));
  if (missingFilters.length || missingEncoders.length) {
    problems.push({
      code: "ffmpeg-features-missing",
      message: `${ffmpeg2} lacks ${[...missingFilters.map((f) => `filter ${f}`), ...missingEncoders.map((e) => `encoder ${e}`)].join(", ")}; use a full ffmpeg build (e.g. gyan.dev essentials on Windows)`
    });
  }
  let font = null;
  if (options.needFont) {
    const candidates = defaultFont(env);
    for (const candidate of candidates) {
      if (await fs24.stat(candidate).catch(() => null)) {
        font = { path: candidate, sha256: (await hashFile(candidate)).sha256 };
        break;
      }
    }
    if (!font) problems.push({ code: "font-missing", message: `no caption font found (${candidates.join(", ")}); set DARKMIND_FONT to a .ttf file` });
  }
  let stt = null;
  const config = sttConfig(env);
  if (config) {
    const model = await fs24.stat(config.model).catch(() => null);
    if (!model?.isFile()) problems.push({ code: "stt-model-missing", message: `DARKMIND_WHISPER_MODEL ${config.model} does not exist` });
    else stt = { program: config.program, model: path22.basename(config.model), modelSha256: (await hashFile(config.model)).sha256 };
  }
  return {
    toolchain: {
      node: process.version,
      ffmpeg: ffmpeg2,
      ffprobe,
      ffmpegMajor: ffmpegMajor(ffmpeg2),
      filters: REQUIRED_FILTERS.filter((name) => !missingFilters.includes(name)),
      encoders: REQUIRED_ENCODERS.filter((name) => !missingEncoders.includes(name)),
      font,
      stt
    },
    problems
  };
}
function toolchainKey(toolchain) {
  return sha256Hex(JSON.stringify({ ffmpeg: toolchain.ffmpeg, font: toolchain.font?.sha256 ?? null }));
}
var BRAND_PACK_FILE = "extensions/brand-pack/brand.json";
async function detectBrandPack(root) {
  let parsed;
  try {
    parsed = JSON.parse((await fs24.readFile(path22.join(root, ...BRAND_PACK_FILE.split("/")), "utf8")).replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
  const value2 = parsed;
  const ok = (text3) => typeof text3 === "string" && text3.length > 0 && text3.length <= 100;
  if (value2?.kind !== "darkmind-brand-pack" || !ok(value2.version)) return null;
  const id2 = ok(value2.id) && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value2.id) ? value2.id : null;
  return id2 ? { id: id2, version: value2.version } : null;
}
function toolchainDocument(toolchain, existing, skill = null, brandPack) {
  const tools = [
    { name: "node", version: toolchain.node },
    { name: "ffmpeg", version: toolchain.ffmpeg.replace(/^ffmpeg version\s+/, ""), features: [...toolchain.encoders, ...toolchain.filters] },
    { name: "ffprobe", version: toolchain.ffprobe.replace(/^ffprobe version\s+/, "") }
  ];
  if (toolchain.font) tools.push({ name: "caption-font", version: `${path22.basename(toolchain.font.path)} sha256:${toolchain.font.sha256.slice(0, 16)}` });
  else {
    const recorded = existing?.tools?.find((tool) => tool?.name === "caption-font");
    if (recorded) tools.push(recorded);
  }
  if (toolchain.stt) tools.push({ name: "whisper.cpp", version: `${toolchain.stt.model} sha256:${toolchain.stt.modelSha256.slice(0, 16)}` });
  return {
    ...typeof existing?.$schema === "string" ? { $schema: existing.$schema } : {},
    schemaVersion: 1,
    pipeline: { name: "darkmind-agent", version: AGENT_VERSION },
    skill: skill ? { version: skill.version } : existing?.skill ?? null,
    brandPack: brandPack === void 0 ? existing?.brandPack ?? null : brandPack,
    tools
  };
}
async function writeToolchain(root, relPath, toolchain, skill) {
  const file = path22.join(root, ...relPath.split("/"));
  let existing = null;
  try {
    existing = await readJsonFile(file);
  } catch {
    throw new CliError("invalid-json", `${relPath} is not valid JSON`);
  }
  const next = toolchainDocument(toolchain, existing, skill === void 0 ? await detectSkill() : skill, await detectBrandPack(root));
  const strip = (doc) => doc ? JSON.stringify({ ...doc, $schema: void 0 }) : "";
  if (existing && strip(existing) === strip(next)) return false;
  await writeFileAtomic(file, `${JSON.stringify(next, null, 2)}
`);
  return true;
}

// src/pipeline/render.ts
var RENDERER_VERSION = "wp7-1";
var RENDER_DIRS = { proxy: "proxy", original: "final", sections: "sections", cache: ".cache", tmp: ".tmp" };
var canonical = (value2) => sha256Hex(JSON.stringify(value2));
function fingerprint(file) {
  return file.sha256 ? { path: file.path, size: file.size, sha256: file.sha256 } : { path: file.path, size: file.size, mtimeMs: file.mtimeMs };
}
function segmentRanges(from, to, size) {
  const ranges = [];
  let start = from;
  while (start < to) {
    const end = Math.min(to, (Math.floor(start / size) + 1) * size);
    ranges.push({ from: start, to: end });
    start = end;
  }
  return ranges;
}
function segmentKey(plan, range2, base) {
  const clips = plan.video.flatMap(
    (track) => track.clips.filter((clip) => clipSpan(clip, range2.from, range2.to)).map((clip) => ({ track: track.id, ...clip, file: fingerprint(plan.files[clip.file]) }))
  );
  const captions = base.captions ? plan.captions.filter((c) => c.end > range2.from && c.start < range2.to) : [];
  return canonical({ renderer: RENDERER_VERSION, recipe: base.recipe, toolchain: base.toolchain, output: plan.output, range: range2, clips, captions });
}
function audioKey(plan, range2, toolchain) {
  const clips = plan.audio.flatMap(
    (track) => track.clips.filter((clip) => clipSpan(clip, range2.from, range2.to)).map((clip) => ({ track: track.id, ...clip, file: fingerprint(plan.files[clip.file]) }))
  );
  return canonical({ renderer: RENDERER_VERSION, toolchain, output: plan.output, range: range2, clips, ducking: plan.audioMaster?.ducking ?? void 0 });
}
async function cachedEntry(file) {
  const meta = await readJsonFile(`${file}.json`).catch(() => null);
  if (!meta) return null;
  const stat = await fs25.stat(file).catch(() => null);
  if (!stat || stat.size !== meta.size) return null;
  const { sha256: sha2563 } = await hashFile(file);
  if (sha2563 !== meta.sha256) return null;
  const now = /* @__PURE__ */ new Date();
  await fs25.utimes(file, now, now).catch(() => {
  });
  return meta;
}
async function storeEntry(temp, file, frames) {
  const { sha256: sha2563, size } = await hashFile(temp);
  await fs25.mkdir(path23.dirname(file), { recursive: true });
  await renameWithRetry(temp, file);
  const entry = { sha256: sha2563, size, frames, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
  await writeJsonFile(`${file}.json`, entry);
  return entry;
}
async function run(tools, args, cwd, signal, what) {
  const result = await tools.run(tools.ffmpeg, args, { cwd, signal, timeoutMs: 6 * 60 * 6e4 });
  if (result.code !== 0) {
    const reason = result.stderr.trim().split(/\r?\n/).slice(-3).join(" | ") || `exit code ${result.code}`;
    throw new CliError("ffmpeg-failed", `${what}: ffmpeg failed: ${reason.replace(/https?:\/\/\S+/g, "<url>")}`);
  }
}
async function verifyOutput(tools, file, plan, frames) {
  const result = await tools.run(tools.ffprobe, ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { timeoutMs: 12e4 });
  if (result.code !== 0) return { profile: null, problems: [`ffprobe cannot read the output: ${result.stderr.trim()}`] };
  const data = JSON.parse(result.stdout || "{}");
  const v = data.streams?.find((s) => s.codec_type === "video");
  const a = data.streams?.find((s) => s.codec_type === "audio");
  const fps = parseRational(plan.output.fps);
  const fpsText = `${fps.n}/${fps.d}`;
  const profile = {
    width: Number(v?.width ?? 0),
    height: Number(v?.height ?? 0),
    fps: String(v?.avg_frame_rate ?? ""),
    frames: Number(v?.nb_frames ?? 0),
    videoCodec: String(v?.codec_name ?? ""),
    pixelFormat: String(v?.pix_fmt ?? ""),
    audioCodec: String(a?.codec_name ?? ""),
    sampleRate: Number(a?.sample_rate ?? 0),
    channels: Number(a?.channels ?? 0),
    audioSeconds: Number(a?.duration ?? 0)
  };
  const problems = [];
  if (profile.width !== plan.output.width || profile.height !== plan.output.height) problems.push(`size ${profile.width}x${profile.height}`);
  if (v?.sample_aspect_ratio && v.sample_aspect_ratio !== "1:1" && v.sample_aspect_ratio !== "0:1") problems.push(`pixel aspect ${v.sample_aspect_ratio}`);
  if (v?.r_frame_rate !== fpsText || v?.avg_frame_rate !== fpsText) problems.push(`frame rate r=${v?.r_frame_rate} avg=${v?.avg_frame_rate} instead of ${fpsText}`);
  if (profile.videoCodec !== "h264" || profile.pixelFormat !== "yuv420p") problems.push(`video ${profile.videoCodec}/${profile.pixelFormat}`);
  if (profile.audioCodec !== "aac" || profile.sampleRate !== plan.output.sampleRate || profile.channels !== 2) problems.push(`audio ${profile.audioCodec} ${profile.sampleRate} Hz ${profile.channels} ch`);
  const seconds2 = frames / toNumberQ(fps);
  if (Math.abs(profile.audioSeconds - seconds2) > 1 / toNumberQ(fps) + 1e-3) problems.push(`audio lasts ${profile.audioSeconds.toFixed(3)} s, the video ${seconds2.toFixed(3)} s`);
  const pts = await probeFramePts(tools, file);
  if (pts.length !== frames) problems.push(`${pts.length} frames instead of ${frames}`);
  else {
    const bad = pts.findIndex((value2, k) => value2.n * fps.n !== BigInt(k) * value2.d * fps.d);
    if (bad >= 0) problems.push(`frame ${bad} is at ${formatRationalReadable(pts[bad])} s instead of ${formatRationalReadable(framesToSeconds(bad, fps))} s (not constant ${fpsText})`);
  }
  return { profile, problems };
}
async function acquireLock(file) {
  await fs25.mkdir(path23.dirname(file), { recursive: true });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const handle = await fs25.open(file, "wx");
      await handle.writeFile(String(process.pid));
      await handle.close();
      return () => fs25.rm(file, { force: true });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      const pid = Number(await fs25.readFile(file, "utf8").catch(() => ""));
      let alive = false;
      try {
        if (pid > 0) {
          process.kill(pid, 0);
          alive = true;
        }
      } catch {
        alive = false;
      }
      if (alive && pid !== process.pid) throw new CliError("render-running", `another render is running in this project folder (process ${pid}); wait for it or stop it`);
      await fs25.rm(file, { force: true });
    }
  }
  throw new CliError("render-running", "could not lock renders/.lock");
}
async function nextVersion(dir) {
  const names = await fs25.readdir(dir).catch(() => []);
  const numbers = names.map((name) => /^v(\d{4,})\.mp4$/.exec(name)?.[1]).filter((n) => Boolean(n)).map(Number).sort((a, b) => a - b);
  const last = numbers[numbers.length - 1] ?? 0;
  return { number: last + 1, previous: last ? `v${String(last).padStart(4, "0")}` : null };
}
async function artifactHashes(root, plan, documents) {
  const paths = /* @__PURE__ */ new Set([EDIT_DEFAULT_FILES.project, ...Object.values(documents.project.artifacts).filter((p) => Boolean(p)), ...documents.project.extensions]);
  for (const file of plan.files) if (file.role === "asset") paths.add(file.path);
  const result = {};
  for (const rel3 of [...paths].sort()) {
    const abs2 = path23.join(root, ...rel3.split("/"));
    if (await fs25.stat(abs2).catch(() => null)) result[rel3] = (await hashFile(abs2)).sha256;
  }
  return result;
}
function estimateBytes(plan, frames, mode) {
  const seconds2 = frames / toNumberQ(parseRational(plan.output.fps));
  const pixels = plan.output.width * plan.output.height / (1920 * 1080);
  const videoBitsPerSecond = (mode === "proxy" ? 8e6 : 2e7) * pixels;
  return Math.round((videoBitsPerSecond / 8 * 2.2 + 48e3 * 2 * 3 * 1.5) * seconds2 + 64 * 1024 ** 2);
}
async function pruneCache2(dir, keep, maxAgeMs) {
  const now = Date.now();
  for (const name of await fs25.readdir(dir).catch(() => [])) {
    if (name.endsWith(".json")) continue;
    const file = path23.join(dir, name);
    if (keep.has(file)) continue;
    const stat = await fs25.stat(file).catch(() => null);
    if (stat && now - stat.mtimeMs > maxAgeMs) {
      await fs25.rm(file, { force: true });
      await fs25.rm(`${file}.json`, { force: true });
      await fs25.rm(`${file}.loudness.json`, { force: true });
    }
  }
}
var PreflightError = class extends CliError {
};
async function renderProject(request) {
  const { root, mode, tools } = request;
  const started = Date.now();
  const progress = request.progress ?? (() => {
  });
  const captionsEnabled = request.captions !== false;
  const rendersDir = path23.join(root, "renders");
  const release = await acquireLock(path23.join(rendersDir, ".lock"));
  const workDir = path23.join(rendersDir, RENDER_DIRS.tmp, `${Date.now()}-${process.pid}`);
  try {
    const detected = await detectToolchain(tools, request.env, { needFont: captionsEnabled });
    const hashCache = await HashCache.load(mediaHashCachePath(root));
    if (!detected.toolchain) throw new PreflightError("preflight-failed", detected.problems.map((p) => p.message).join("; "), { issues: detected.problems.map((p) => ({ severity: "error", ...p })) });
    const toolchain = detected.toolchain;
    let gate = null;
    const action = mode === "original" ? "render-original" : request.section ? "render-proxy-section" : "render-proxy";
    const rendering = toolchainBinding(toolchainDocument(toolchain, null));
    const override = mode === "original" && rendering ? { ffmpeg: rendering.ffmpeg, ...captionsEnabled && toolchain.font ? { captionFont: rendering.captionFont } : {} } : void 0;
    if (request.reviewGates !== false) gate = (await requireReviewGate(root, action, { toolchain: override })).gate;
    let extensionResults = [];
    if (request.extensions !== false) {
      const summary3 = await runExtensions({ root, mode, tools, env: request.env, neededOnly: true, signal: request.signal, progress });
      if (!summary3.ok) throw extensionsError(summary3);
      extensionResults = summary3.results.map(({ id: id2, action: action2, key, sha256: sha2564, output: output2 }) => ({ id: id2, action: action2, key, sha256: sha2564, output: output2 }));
    }
    const planned = await buildExecutionPlan({ root, mode, tools, hashes: { cache: hashCache, computeOriginals: mode === "original" }, signal: request.signal });
    await hashCache.save();
    if (gate && planned.validation.documents) {
      const again = evaluateGate(await computeReviewState(root, { validation: planned.validation, toolchain: override }), action);
      if (again.status === "blocked") throw gateError(again);
      gate = again;
    }
    const bindingsOfPlan = async () => {
      const ofPlan = reviewBindings(await computeReviewState(root, { validation: planned.validation }));
      const now = reviewBindings(await computeReviewState(root));
      if (canonical(ofPlan) !== canonical(now)) {
        throw new CliError("project-changed", "The project changed while rendering; nothing was published. Render again (finished segments stay cached).");
      }
      return ofPlan;
    };
    const issues = [...planned.issues];
    const plan = planned.plan;
    const useCaptions = captionsEnabled && Boolean(plan?.captions.length) && plan?.captionStyle === "plain";
    for (const problem of detected.problems) {
      if (problem.code === "font-missing" && !useCaptions) continue;
      if (problem.code === "stt-model-missing") issues.push({ severity: "warning", ...problem });
      else issues.push({ severity: "error", ...problem });
    }
    const errors = issues.filter((issue) => issue.severity === "error");
    if (!plan || errors.length) {
      throw new PreflightError("preflight-failed", `Preflight failed: ${errors.map((e) => `${e.ref ? `${e.ref}: ` : ""}${e.message}`).slice(0, 5).join("; ")}${errors.length > 5 ? ` (+${errors.length - 5} more)` : ""}`, {
        issues,
        needs: planned.needs
      });
    }
    const section = request.section ?? null;
    const from = section?.from ?? 0;
    const to = section?.to ?? plan.totalFrames;
    if (!(Number.isInteger(from) && Number.isInteger(to) && from >= 0 && to > from && to <= plan.totalFrames)) {
      throw new CliError("invalid-input", `--section must lie within 0-${plan.totalFrames} (frames, end exclusive)`);
    }
    const free = await fs25.statfs(root).then((s) => Number(s.bavail) * Number(s.bsize)).catch(() => null);
    const needed = estimateBytes(plan, to - from, mode);
    if (free !== null && free < needed) throw new PreflightError("disk-space", `Not enough free disk space for the render: about ${Math.ceil(needed / 1024 ** 2)} MB needed, ${Math.floor(free / 1024 ** 2)} MB free`);
    const recipe = request.recipe ?? RENDER_RECIPES[mode];
    const tcKey = toolchainKey(toolchain);
    const inputPath = (file) => path23.join(root, ...file.path.split("/"));
    await fs25.mkdir(workDir, { recursive: true });
    if (useCaptions) await fs25.copyFile(toolchain.font.path, path23.join(workDir, CAPTION_FONT_FILE));
    const fpsQ = parseRational(plan.output.fps);
    const segmentSize = request.segmentFrames ?? Number(fpsQ.n / fpsQ.d) * 10;
    const ranges = segmentRanges(from, to, segmentSize);
    const segmentDir = path23.join(rendersDir, RENDER_DIRS.cache, "segments");
    const audioDir = path23.join(rendersDir, RENDER_DIRS.cache, "audio");
    const segmentFiles = [];
    let reused = 0;
    const renderStart = Date.now();
    for (const [index, range2] of ranges.entries()) {
      const key = segmentKey(plan, range2, { recipe, toolchain: tcKey, captions: useCaptions });
      const file = path23.join(segmentDir, `${key}.mp4`);
      segmentFiles.push(file);
      if (await cachedEntry(file)) {
        reused++;
        continue;
      }
      progress(`segment ${index + 1}/${ranges.length} (frames ${range2.from}-${range2.to})`);
      const temp = path23.join(workDir, `segment-${index}.mp4`);
      const graph = videoSegmentArgs(plan, range2.from, range2.to, { recipe, captions: useCaptions, out: temp, inputPath });
      for (const extra of graph.files) await fs25.writeFile(path23.join(workDir, extra.name), extra.content, "utf8");
      await run(tools, await withGraphFile(graph.args, workDir, toolchain.ffmpegMajor, `segment-${index}`), workDir, request.signal, `segment ${range2.from}-${range2.to}`);
      const pts = await probeFramePts(tools, temp);
      if (pts.length !== range2.to - range2.from) throw new CliError("render-verification-failed", `segment ${range2.from}-${range2.to} has ${pts.length} frames instead of ${range2.to - range2.from}`);
      await storeEntry(temp, file, range2.to - range2.from);
    }
    const aKeyRaw = audioKey(plan, { from, to }, tcKey);
    const mixAudio = async (range2, key, float = false) => {
      const file = path23.join(audioDir, `${key}.wav`);
      if (await cachedEntry(file)) return { file, status: "reused" };
      progress("audio");
      const temp = path23.join(workDir, `audio-${key.slice(0, 12)}.wav`);
      const graph = audioArgs(plan, range2.from, range2.to, { out: temp, inputPath, float });
      await run(tools, await withGraphFile(graph.args, workDir, toolchain.ffmpegMajor, "audio"), workDir, request.signal, "audio");
      await storeEntry(temp, file, range2.to - range2.from);
      return { file, status: "rendered" };
    };
    let aKey = aKeyRaw;
    let audioFile;
    let audioStatus;
    let mastered = null;
    if (plan.audioMaster) {
      const master = plan.audioMaster;
      const full = { from: 0, to: plan.totalFrames };
      const raw = await mixAudio(full, canonical({ mix: "f32", key: audioKey(plan, full, tcKey) }), true);
      const mKey = canonical({ raw: path23.basename(raw.file), master, version: AUDIO_MASTER_VERSION });
      const masterFile = path23.join(audioDir, `master-${mKey}.wav`);
      const sidecar = `${masterFile}.loudness.json`;
      mastered = await cachedEntry(masterFile) ? await readJsonFile(sidecar).catch(() => null) : null;
      audioStatus = raw.status;
      if (!mastered) {
        progress("audio master (gain, peak limiter)");
        const temp = path23.join(workDir, "audio-master.wav");
        mastered = await masterAudio(tools, raw.file, temp, master, { sampleRate: plan.output.sampleRate, samples: Number(samplesFor(plan.totalFrames, plan)), signal: request.signal });
        await storeEntry(temp, masterFile, plan.totalFrames);
        await writeJsonFile(sidecar, mastered);
        audioStatus = "rendered";
      }
      aKey = canonical({ master: mKey, from, to });
      if (from === 0 && to === plan.totalFrames) audioFile = masterFile;
      else {
        audioFile = path23.join(audioDir, `${aKey}.wav`);
        if (!await cachedEntry(audioFile)) {
          const temp = path23.join(workDir, "audio-section.wav");
          const [s0, s1] = [samplesFor(from, plan), samplesFor(to, plan)];
          await run(tools, ["-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-i", masterFile, "-af", `atrim=start_sample=${s0}:end_sample=${s1},asetpts=PTS-STARTPTS`, "-c:a", "pcm_s24le", temp], workDir, request.signal, "audio section");
          await storeEntry(temp, audioFile, to - from);
        }
      }
    } else {
      const mixed = await mixAudio({ from, to }, aKeyRaw);
      audioFile = mixed.file;
      audioStatus = mixed.status;
    }
    const renderKey = canonical({ segments: segmentFiles.map((f) => path23.basename(f)), audio: aKey, audioCodec: recipe.audioCodec, captions: useCaptions });
    const kindDir = path23.join(rendersDir, section ? RENDER_DIRS.sections : RENDER_DIRS[mode]);
    const version = section ? null : await nextVersion(kindDir);
    if (version?.previous) {
      const previousReport = await readJsonFile(path23.join(kindDir, `${version.previous}.json`)).catch(() => null);
      const previousFile = path23.join(kindDir, `${version.previous}.mp4`);
      const previousSync = previousReport?.checks?.sync;
      const checksSatisfied = request.checks === false || !(previousSync?.status === "skipped" && previousSync.reason === "checks disabled");
      if (previousReport?.renderKey === renderKey && checksSatisfied && await fs25.stat(previousFile).catch(() => null) && (await hashFile(previousFile)).sha256 === previousReport.sha256) {
        await pruneCache2(segmentDir, new Set(segmentFiles), 14 * 864e5);
        const bindings = await bindingsOfPlan();
        const reportFile2 = `renders/${RENDER_DIRS[mode]}/${version.previous}.json`;
        if (canonical(previousReport.review?.bindings ?? null) !== canonical(bindings) || gate && previousReport.review?.gate?.status !== "passed") {
          previousReport.review = { ...reviewNote(mode), bindings, gate: gate ?? previousReport.review?.gate ?? null };
          await writeJsonFile(path23.join(root, ...reportFile2.split("/")), previousReport);
        }
        return { status: "unchanged", output: previousReport.output, reportFile: reportFile2, report: previousReport };
      }
    }
    progress("mux");
    const list2 = segmentFiles.map((file) => `file '${file.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n");
    await fs25.writeFile(path23.join(workDir, "segments.txt"), `${list2}
`);
    const muxed = path23.join(workDir, "output.mp4");
    await run(
      tools,
      ["-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", "segments.txt", "-i", audioFile, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", ...recipe.audioCodec, "-ar", String(plan.output.sampleRate), "-ac", "2", "-movflags", "+faststart", "output.mp4"],
      workDir,
      request.signal,
      "mux"
    );
    const verified = await verifyOutput(tools, muxed, plan, to - from);
    if (verified.problems.length) throw new CliError("render-verification-failed", `The rendered file does not match the plan: ${verified.problems.join("; ")}`, { problems: verified.problems });
    const renderSeconds = (Date.now() - renderStart) / 1e3;
    const baseName = section ? `${RENDER_DIRS[mode]}-${from}-${to}` : `v${String(version.number).padStart(4, "0")}`;
    const outputAbs = path23.join(kindDir, `${baseName}.mp4`);
    const output = path23.relative(root, outputAbs).split(path23.sep).join("/");
    const { sha256: sha2563, size } = await hashFile(muxed);
    const checkStart = Date.now();
    const skipped = (reason) => ({ status: "skipped", reason });
    const runChecks = !section && request.checks !== false;
    let sync = skipped(section ? "section render" : "checks disabled");
    let transcription = skipped(section ? "section render" : "checks disabled");
    let changes = skipped(section ? "section render" : "checks disabled");
    let loudness = skipped(!plan.audioMaster ? "no audioMaster in project.json" : section ? "section render" : "checks disabled");
    if (runChecks) {
      if (plan.audioMaster) {
        progress("checks: loudness");
        loudness = loudnessCheck(await measureLoudness(tools, muxed, { signal: request.signal }), plan.audioMaster);
      }
      progress("checks: sync");
      sync = await syncCheck(tools, plan, muxed, (id2) => inputPath(plan.files[id2]), { signal: request.signal }).catch((error) => {
        if (error instanceof AbortedError) throw error;
        return skipped(`sync check failed: ${errorMessage(error)}`);
      });
      progress("checks: transcription");
      const stt = toolchain.stt ? sttConfig(request.env) : null;
      const { words: _words, ...transcript } = await transcriptionCheck(tools, plan, muxed, stt, workDir, { signal: request.signal });
      transcription = transcript;
      progress("checks: changes");
      const previous = version.previous ? { file: path23.join(kindDir, `${version.previous}.mp4`), report: await readJsonFile(path23.join(kindDir, `${version.previous}.json`)).catch(() => null) } : null;
      const comparable = previous?.report && previous.report.profile.width === plan.output.width && previous.report.profile.height === plan.output.height && await fs25.stat(previous.file).catch(() => null);
      changes = previous && !comparable ? { status: "not-comparable", against: `renders/${RENDER_DIRS[mode]}/${version.previous}.mp4`, thresholdDb: 40, comparedFrames: 0, video: [], audio: [], changed: [], changedFrames: 0, note: "previous version missing or with another output size" } : await changeCheck(tools, { file: muxed, frames: to - from }, previous ? { file: previous.file, frames: previous.report.frames, label: `renders/${RENDER_DIRS[mode]}/${version.previous}.mp4` } : null, plan, workDir, { signal: request.signal }).catch(
        (error) => {
          if (error instanceof AbortedError) throw error;
          return skipped(`change check failed: ${errorMessage(error)}`);
        }
      );
    }
    const documents = planned.validation.documents;
    const toolchainPath = documents.project.artifacts.toolchain ?? EDIT_DEFAULT_FILES.toolchain;
    await writeToolchain(root, toolchainPath, toolchain);
    if (!documents.project.artifacts.toolchain) {
      issues.push({ severity: "warning", code: "toolchain-not-referenced", message: `wrote ${toolchainPath}; add "toolchain": "${toolchainPath}" to project.json artifacts so it is validated and reviewed` });
    }
    const report = {
      kind: "darkmind-render-report",
      version: 1,
      mode,
      output,
      sha256: sha2563,
      size,
      createdAt: (request.now?.() ?? /* @__PURE__ */ new Date()).toISOString(),
      agentVersion: AGENT_VERSION,
      section,
      frames: to - from,
      durationSeconds: formatRationalReadable(framesToSeconds(to - from, fpsQ)),
      profile: verified.profile,
      renderKey,
      recipe: recipe.id,
      // visible captions: burnt in (plain) or drawn by the brand caption block on the timeline (brand styles, T8)
      captions: plan.captionStyle === "plain" ? useCaptions : !planned.validation.issues.some((issue) => issue.code === "brand-captions-unrendered"),
      toolchain: toolchainDocument(toolchain, null),
      validation: {
        ready: planned.validation.ready,
        counts: planned.validation.counts,
        pending: [...new Set(planned.validation.issues.filter((i) => i.severity === "pending").map((i) => i.code))]
      },
      preflight: issues,
      cache: { segments: ranges.length, reused, rendered: ranges.length - reused, audio: audioStatus },
      timings: { totalSeconds: round2((Date.now() - started) / 1e3), renderSeconds: round2(renderSeconds), checkSeconds: round2((Date.now() - checkStart) / 1e3) },
      artifacts: await artifactHashes(root, plan, documents),
      media: plan.files.map((file) => ({
        file: file.path,
        role: file.role,
        ...file.sourceId ? { sourceId: file.sourceId } : {},
        ...file.extensionId ? { extensionId: file.extensionId } : {},
        offset: file.offset,
        ...file.sha256 ? { sha256: file.sha256 } : {}
      })),
      extensions: extensionResults,
      checks: { profile: { status: "pass", problems: [] }, sync, transcription, changes, loudness },
      audioMaster: mastered,
      review: { ...reviewNote(mode), bindings: await bindingsOfPlan(), gate },
      plan
    };
    const reportFile = path23.join(kindDir, `${baseName}.json`);
    await fs25.mkdir(kindDir, { recursive: true });
    await fs25.rm(reportFile, { force: true });
    await fs25.rm(outputAbs, { force: true });
    await renameWithRetry(muxed, outputAbs);
    try {
      await writeJsonFile(reportFile, report);
    } catch (error) {
      await fs25.rm(outputAbs, { force: true });
      throw error;
    }
    await pruneCache2(segmentDir, new Set(segmentFiles), 14 * 864e5);
    await pruneCache2(audioDir, /* @__PURE__ */ new Set([audioFile]), 14 * 864e5);
    return { status: "rendered", output, reportFile: path23.relative(root, reportFile).split(path23.sep).join("/"), report };
  } catch (error) {
    if (error instanceof AbortedError) throw new CliError("aborted", "The render was cancelled; finished segments stay cached and are reused by the next run.");
    throw error;
  } finally {
    await fs25.rm(workDir, { recursive: true, force: true }).catch(() => {
    });
    await release();
  }
}
var round2 = (value2) => Math.round(value2 * 100) / 100;
function reviewNote(mode) {
  return {
    status: "not-reviewed",
    note: mode === "original" ? "Final output, not yet approved: the editor approves it after viewing it (darkmind-agent review show final)." : "Proxy preview for the review of the editor (darkmind-agent review show preview); section renders cannot be approved."
  };
}

// src/pipeline/xmeml.ts
var PPRO_TICKS_PER_SECOND = 254016000000n;
var esc = (value2) => value2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function relativePathUrl(relPath) {
  return relPath.split("/").map(encodeURIComponent).join("/");
}
function toTicks(seconds2) {
  return floorQ(mulQ(seconds2, rational(PPRO_TICKS_PER_SECOND)));
}
function xmlNumber(value2, decimals) {
  const text3 = value2.toFixed(decimals).replace(/\.?0+$/, "");
  return text3 === "-0" ? "0" : text3;
}
var rateXml = (timebase, ntsc, ind) => `${ind}<rate>
${ind}	<timebase>${timebase}</timebase>
${ind}	<ntsc>${ntsc ? "TRUE" : "FALSE"}</ntsc>
${ind}</rate>`;
function framesOf(seconds2, timebase) {
  return floorQ(mulQ(seconds2, rational(timebase)));
}
function buildXmeml(seq) {
  const tb = seq.fps;
  const fpsQ = rational(tb);
  const files = /* @__PURE__ */ new Map();
  const groups = /* @__PURE__ */ new Map();
  let clipSeq = 0;
  const register = (group, ref) => {
    const list2 = groups.get(group) ?? [];
    list2.push(ref);
    groups.set(group, list2);
  };
  const videoItems = seq.video.map(
    (clips, ti) => clips.map((clip, ci) => {
      const xmlId = `clipitem-${++clipSeq}`;
      register(clip.link, { xmlId, mediatype: "video", trackIndex: ti + 1, clipIndex: ci + 1 });
      return { clip, xmlId };
    })
  );
  const audioTracks = [];
  seq.audio.forEach((clips) => {
    const pair = [[], []];
    clips.forEach((clip, ci) => {
      for (let channel = 0; channel < 2; channel++) {
        const xmlId = `clipitem-${++clipSeq}`;
        pair[channel].push({ clip, xmlId, channel });
        register(clip.link, { xmlId, mediatype: "audio", trackIndex: audioTracks.length + channel + 1, clipIndex: ci + 1 });
      }
    });
    audioTracks.push({ channel: 0, items: pair[0] }, { channel: 1, items: pair[1] });
  });
  const fileXml = (file, ind) => {
    const known = files.get(file.path);
    if (known) return `${ind}<file id="${known.id}"/>`;
    const entry = { id: `file-${files.size + 1}`, master: `masterclip-${files.size + 1}` };
    files.set(file.path, entry);
    const i2 = `${ind}	`;
    const lines = [
      `${ind}<file id="${entry.id}">`,
      `${i2}<name>${esc(file.name)}</name>`,
      `${i2}<pathurl>${esc(relativePathUrl(file.path))}</pathurl>`,
      rateXml(file.timebase, file.ntsc, i2),
      `${i2}<duration>${framesOf(file.durationSeconds, file.timebase)}</duration>`,
      `${i2}<timecode>`,
      rateXml(file.timebase, file.ntsc, `${i2}	`),
      `${i2}	<string>00:00:00:00</string>`,
      `${i2}	<frame>0</frame>`,
      `${i2}	<displayformat>NDF</displayformat>`,
      `${i2}</timecode>`,
      `${i2}<media>`
    ];
    if (file.video) {
      lines.push(
        `${i2}	<video>`,
        `${i2}		<samplecharacteristics>`,
        rateXml(file.timebase, file.ntsc, `${i2}			`),
        `${i2}			<width>${file.video.width}</width>`,
        `${i2}			<height>${file.video.height}</height>`,
        `${i2}			<anamorphic>FALSE</anamorphic>`,
        `${i2}			<pixelaspectratio>square</pixelaspectratio>`,
        `${i2}			<fielddominance>none</fielddominance>`,
        `${i2}		</samplecharacteristics>`,
        `${i2}	</video>`
      );
    }
    if (file.audio) {
      lines.push(
        `${i2}	<audio>`,
        `${i2}		<samplecharacteristics>`,
        `${i2}			<depth>16</depth>`,
        `${i2}			<samplerate>${file.audio.sampleRate}</samplerate>`,
        `${i2}		</samplecharacteristics>`,
        `${i2}		<channelcount>${file.audio.channels}</channelcount>`,
        `${i2}	</audio>`
      );
    }
    lines.push(`${i2}</media>`, `${ind}</file>`);
    return lines.join("\n");
  };
  const masterOf = (file) => files.get(file.path)?.master ?? `masterclip-${files.size + 1}`;
  const timing = (clip, ind) => {
    const inFrames = floorQ(mulQ(clip.inExec, fpsQ));
    const ticksIn = toTicks(clip.inExec);
    const ticksOut = toTicks(addQ(clip.inExec, divQ(rational(clip.frames), fpsQ)));
    return [
      `${ind}<start>${clip.start}</start>`,
      `${ind}<end>${clip.start + clip.frames}</end>`,
      `${ind}<in>${inFrames}</in>`,
      `${ind}<out>${inFrames + BigInt(clip.frames)}</out>`,
      `${ind}<pproTicksIn>${ticksIn}</pproTicksIn>`,
      `${ind}<pproTicksOut>${ticksOut}</pproTicksOut>`
    ].join("\n");
  };
  const linksXml = (group, ind) => {
    const refs = groups.get(group) ?? [];
    if (refs.length < 2) return null;
    return refs.map((r) => `${ind}<link>
${ind}	<linkclipref>${r.xmlId}</linkclipref>
${ind}	<mediatype>${r.mediatype}</mediatype>
${ind}	<trackindex>${r.trackIndex}</trackindex>
${ind}	<clipindex>${r.clipIndex}</clipindex>
${ind}</link>`).join("\n");
  };
  const labelXml = (label2, ind) => label2 ? `${ind}<labels>
${ind}	<label2>${esc(label2)}</label2>
${ind}</labels>` : null;
  const param = (ind, id2, name, value2, min, max) => [`${ind}<parameter authoringApp="PremierePro">`, `${ind}	<parameterid>${id2}</parameterid>`, `${ind}	<name>${name}</name>`, ...min !== void 0 ? [`${ind}	<valuemin>${min}</valuemin>`, `${ind}	<valuemax>${max}</valuemax>`] : [], `${ind}	<value>${value2}</value>`, `${ind}</parameter>`].join("\n");
  const point = (ind, id2, name, x, y) => [`${ind}<parameter authoringApp="PremierePro">`, `${ind}	<parameterid>${id2}</parameterid>`, `${ind}	<name>${name}</name>`, `${ind}	<value>`, `${ind}		<horiz>${x}</horiz>`, `${ind}		<vert>${y}</vert>`, `${ind}	</value>`, `${ind}</parameter>`].join("\n");
  const motionXml = (clip, ind) => [
    `${ind}<effect>`,
    `${ind}	<name>Basic Motion</name>`,
    `${ind}	<effectid>basic</effectid>`,
    `${ind}	<effectcategory>motion</effectcategory>`,
    `${ind}	<effecttype>motion</effecttype>`,
    `${ind}	<mediatype>video</mediatype>`,
    `${ind}	<pproBypass>false</pproBypass>`,
    param(`${ind}	`, "scale", "Scale", xmlNumber(clip.scalePercent, 6), 0, 1e3),
    param(`${ind}	`, "rotation", "Rotation", "0", -8640, 8640),
    point(`${ind}	`, "center", "Center", xmlNumber(clip.centerX, 9), xmlNumber(clip.centerY, 9)),
    point(`${ind}	`, "centerOffset", "Anchor Point", "0", "0"),
    param(`${ind}	`, "antiflicker", "Anti-flicker Filter", "0", 0, 1),
    `${ind}</effect>`
  ].join("\n");
  const levelXml = (gainDb, ind) => [
    `${ind}<effect>`,
    `${ind}	<name>Audio Levels</name>`,
    `${ind}	<effectid>audiolevels</effectid>`,
    `${ind}	<effectcategory>audiolevels</effectcategory>`,
    `${ind}	<effecttype>audiolevels</effecttype>`,
    `${ind}	<mediatype>audio</mediatype>`,
    `${ind}	<pproBypass>false</pproBypass>`,
    param(`${ind}	`, "level", "Level", (10 ** (gainDb / 20)).toFixed(6), 0, 3.98109),
    `${ind}</effect>`
  ].join("\n");
  const I5 = "					";
  const clipDuration = (file) => framesOf(file.durationSeconds, tb);
  const videoXml = videoItems.map((items) => {
    const body = items.map(({ clip, xmlId }) => {
      const file = fileXml(clip.file, `${I5}	`);
      const lines = [
        `${I5}<clipitem id="${xmlId}">`,
        `${I5}	<masterclipid>${masterOf(clip.file)}</masterclipid>`,
        `${I5}	<name>${esc(clip.name)}</name>`,
        `${I5}	<enabled>TRUE</enabled>`,
        `${I5}	<duration>${clipDuration(clip.file)}</duration>`,
        rateXml(tb, false, `${I5}	`),
        timing(clip, `${I5}	`),
        `${I5}	<alphatype>${clip.alpha ? "straight" : "none"}</alphatype>`,
        `${I5}	<pixelaspectratio>square</pixelaspectratio>`,
        `${I5}	<anamorphic>FALSE</anamorphic>`,
        file,
        `${I5}	<filter>`,
        motionXml(clip, `${I5}		`),
        `${I5}	</filter>`
      ];
      const label2 = labelXml(clip.label, `${I5}	`);
      if (label2) lines.push(label2);
      const links = linksXml(clip.link, `${I5}	`);
      if (links) lines.push(links);
      lines.push(`${I5}</clipitem>`);
      return lines.join("\n");
    });
    return [`				<track>`, ...body, `${I5}<enabled>TRUE</enabled>`, `${I5}<locked>FALSE</locked>`, `				</track>`].join("\n");
  }).join("\n");
  const audioXml = audioTracks.map((track) => {
    const body = track.items.map(({ clip, xmlId, channel }) => {
      const sourceTrack = (clip.file.audio?.channels ?? 2) >= 2 ? channel + 1 : 1;
      const lines = [
        `${I5}<clipitem id="${xmlId}" premiereChannelType="stereo">`,
        `${I5}	<masterclipid>${masterOf(clip.file)}</masterclipid>`,
        `${I5}	<name>${esc(clip.name)}</name>`,
        `${I5}	<enabled>TRUE</enabled>`,
        `${I5}	<duration>${clipDuration(clip.file)}</duration>`,
        rateXml(tb, false, `${I5}	`),
        timing(clip, `${I5}	`),
        fileXml(clip.file, `${I5}	`),
        `${I5}	<sourcetrack>`,
        `${I5}		<mediatype>audio</mediatype>`,
        `${I5}		<trackindex>${sourceTrack}</trackindex>`,
        `${I5}	</sourcetrack>`,
        `${I5}	<filter>`,
        levelXml(clip.gainDb, `${I5}		`),
        `${I5}	</filter>`
      ];
      const label2 = labelXml(clip.label, `${I5}	`);
      if (label2) lines.push(label2);
      const links = linksXml(clip.link, `${I5}	`);
      if (links) lines.push(links);
      lines.push(`${I5}</clipitem>`);
      return lines.join("\n");
    });
    return [
      `				<track premiereTrackType="Stereo" currentExplodedTrackIndex="${track.channel}" totalExplodedTrackCount="2">`,
      ...body,
      `${I5}<enabled>TRUE</enabled>`,
      `${I5}<locked>FALSE</locked>`,
      `				</track>`
    ].join("\n");
  }).join("\n");
  const markers = [...seq.markers].sort((a, b) => a.frame - b.frame).map((m) => `		<marker>
			<comment>${esc(m.comment)}</comment>
			<name>${esc(m.name)}</name>
			<in>${m.frame}</in>
			<out>-1</out>
		</marker>`);
  const output = (index) => [`					<group>`, `						<index>${index}</index>`, `						<numchannels>1</numchannels>`, `						<downmix>0</downmix>`, `						<channel>`, `							<index>${index}</index>`, `						</channel>`, `					</group>`].join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<!DOCTYPE xmeml>",
    '<xmeml version="4">',
    '	<sequence id="sequence-1" explodedTracks="true">',
    `		<uuid>${seq.uuid}</uuid>`,
    `		<duration>${seq.totalFrames}</duration>`,
    rateXml(tb, false, "		"),
    `		<name>${esc(seq.name)}</name>`,
    "		<media>",
    "			<video>",
    "				<format>",
    "					<samplecharacteristics>",
    rateXml(tb, false, "						"),
    `						<width>${seq.width}</width>`,
    `						<height>${seq.height}</height>`,
    "						<anamorphic>FALSE</anamorphic>",
    "						<pixelaspectratio>square</pixelaspectratio>",
    "						<fielddominance>none</fielddominance>",
    "						<colordepth>24</colordepth>",
    "					</samplecharacteristics>",
    "				</format>",
    ...videoXml ? [videoXml] : [],
    "			</video>",
    "			<audio>",
    "				<numOutputChannels>2</numOutputChannels>",
    "				<format>",
    "					<samplecharacteristics>",
    "						<depth>16</depth>",
    `						<samplerate>${seq.sampleRate}</samplerate>`,
    "					</samplecharacteristics>",
    "				</format>",
    "				<outputs>",
    output(1),
    output(2),
    "				</outputs>",
    ...audioXml ? [audioXml] : [],
    "			</audio>",
    "		</media>",
    "		<timecode>",
    rateXml(tb, false, "			"),
    "			<string>00:00:00:00</string>",
    "			<frame>0</frame>",
    "			<displayformat>NDF</displayformat>",
    "		</timecode>",
    ...markers,
    "	</sequence>",
    "</xmeml>",
    ""
  ].join("\n");
}

// src/pipeline/premiere.ts
var PREMIERE_EXPORTER_VERSION = "p6wp6-1";
var CONFORM_VERSION = "wp5-conform-1";
var PREMIERE_MAX_LEVEL_DB = 15;
var DEFAULT_CONFORM_HANDLE_SECONDS = 5;
var PREMIERE_DIR = "premiere";
var PACKAGE_MANIFEST = "manifest.json";
var PACKAGE_REPORT = "IMPORT.md";
var VERIFIED_PREMIERE = "Adobe Premiere Pro 2027 (27.0.0 build 88) on Windows";
var RENDERED_LABEL = "Mango";
var CONFORM_ENCODERS = ["prores_ks", "pcm_s16le"];
function captionDelivery(captions) {
  if (!captions || captions.captions.length === 0) return "none";
  return captions.style === "plain" ? "srt" : "overlay";
}
function captionOverlayExtensions(docs) {
  const captionsPath = docs.project.artifacts.captions;
  return new Set(
    docs.extensions.filter((extension) => extension.output.alpha && extension.output.video !== false && !extension.output.image && extension.inputs.some((input) => input.kind === "file" && input.path === captionsPath)).map((extension) => extension.id)
  );
}
function premiereVideoTracks(tracks, captionExtensions) {
  const isCaption = (clip) => Boolean(clip.extensionId && captionExtensions.has(clip.extensionId));
  return tracks.flatMap((track) => {
    const captions = track.clips.filter(isCaption);
    const others = track.clips.filter((clip) => !isCaption(clip));
    if (!captions.length) return [{ track, clips: track.clips, captions: false }];
    if (!others.length) return [{ track, clips: captions, captions: true }];
    return [
      { track, clips: others, captions: false },
      { track, clips: captions, captions: true }
    ];
  });
}
var BRAND_RUNNER = "extensions/brand-pack/lib/render.mjs";
var BRAND_ENTRY = /^extensions\/brand-pack\/blocks\/([a-z0-9_]+)\/(?:scene\.html|block\.json)$/;
function brandBlockOf(extension, pack) {
  const args = extension.command.args ?? [];
  const match = extension.command.program === "node" && args[0] === BRAND_RUNNER ? BRAND_ENTRY.exec(args[1] ?? "") : null;
  return match ? { pack: pack?.id ?? "brand-pack", version: pack?.version ?? extension.version, block: match[1] } : null;
}
async function latestFinalReport(root) {
  const dir = path24.join(root, "renders", RENDER_DIRS.original);
  const names = (await fs26.readdir(dir).catch(() => [])).filter((name) => /^v\d{4,}\.json$/.test(name)).sort((a, b) => Number(a.slice(1, -5)) - Number(b.slice(1, -5)));
  const last = names[names.length - 1];
  if (!last) return null;
  const report = await readJsonFile(path24.join(dir, last)).catch(() => null);
  return report?.kind === "darkmind-render-report" ? { file: `renders/${RENDER_DIRS.original}/${last}`, report } : null;
}
var MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
var rel2 = (root, file) => path24.relative(root, file).split(path24.sep).join("/");
function safeName(value2, fallback, max = 60) {
  let name = value2.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/_+/g, "_").replace(/^[._-]+|[._-]+$/g, "").slice(0, max).replace(/[._-]+$/g, "");
  if (!name) name = fallback;
  if (/^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i.test(name)) name = `_${name}`;
  return name;
}
function uuidFromHash(hex) {
  const h = hex.slice(0, 32).split("");
  h[12] = "4";
  h[16] = (parseInt(h[16], 16) & 3 | 8).toString(16);
  const s = h.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
}
async function placeFile(from, to) {
  await fs26.mkdir(path24.dirname(to), { recursive: true });
  const source = await fs26.realpath(from).catch(() => from);
  try {
    await fs26.link(source, to);
    return "hardlink";
  } catch {
    await fs26.copyFile(source, to);
    return "copy";
  }
}
async function nextPackageVersion(dir) {
  const names = await fs26.readdir(dir).catch(() => []);
  const numbers = names.map((name) => /^v(\d{4,})$/.exec(name)?.[1]).filter((n) => Boolean(n)).map(Number).sort((a, b) => a - b);
  const last = numbers[numbers.length - 1] ?? 0;
  return { number: last + 1, previous: last ? `v${String(last).padStart(4, "0")}` : null };
}
function conformRange(clips, fps, durationSeconds, handleSeconds) {
  let from = Number.POSITIVE_INFINITY;
  let to = 0;
  for (const clip of clips) {
    const first = Number(roundHalfUpQ(mulQ(parseRational(clip.inExec), rational(fps))));
    from = Math.min(from, first);
    to = Math.max(to, first + clip.frames);
  }
  const handle = Math.round(handleSeconds * fps);
  const limit = durationSeconds ? Math.floor(toNumberQ(durationSeconds) * fps + 1e-9) : Number.POSITIVE_INFINITY;
  return { fromFrame: Math.max(0, from - handle), toFrame: Math.max(to, Math.min(to + handle, limit)) };
}
var samplesOf = (frames, fps, sampleRate) => BigInt(Math.floor(frames * sampleRate / fps));
function gcd3(a, b) {
  while (b) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}
function conformArgs(spec, input, info, out, proxy) {
  const frames = spec.toFrame - spec.fromFrame;
  const start = rational(spec.fromFrame, spec.fps);
  const seek = seekFor(start);
  const delta = subQ(start, rational(seek));
  const graph = [];
  const map = [];
  if (spec.hasAudio) {
    const p0 = roundHalfUpQ(mulQ(delta, rational(spec.sampleRate)));
    const samples = samplesOf(frames, spec.fps, spec.sampleRate);
    const upmix = info.audio?.channels === 1 ? "pan=stereo|c0=c0|c1=c0," : "";
    const gain = spec.gainDb ? `volume=${spec.gainDb}dB,` : "";
    graph.push(`[0:a]aresample=${spec.sampleRate},${upmix}${gain}atrim=start_pts=${p0}:end_pts=${p0 + samples},asetpts=PTS-STARTPTS,apad=whole_len=${samples},atrim=end_sample=${samples}[a]`);
    map.push("-map", "[a]", "-c:a", "pcm_s16le", "-ar", String(spec.sampleRate), ...proxy ? ["-ac", String(proxy.channels)] : []);
  }
  const head = ["-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-ss", `${seek}`, "-i", input];
  if (spec.audioOnly) return [...head, "-filter_complex", graph.join(";"), ...map, out];
  const v = info.video;
  const L = v.timeBase.d / gcd3(v.timeBase.d, delta.d) * delta.d;
  const shift = mulQ(delta, rational(L));
  const look = proxy?.width && proxy.height ? `scale=${proxy.width}:${proxy.height}:flags=bicubic,format=${evenSize(proxy.width, proxy.height) ? "yuv420p" : "yuv444p"}` : "format=yuv422p10le";
  graph.unshift(`[0:v]settb=1/${L},setpts=PTS-${shift.n},fps=${spec.fps}:round=up,trim=start_pts=0:end_pts=${frames},setpts=PTS-STARTPTS,${look},setsar=1[v]`);
  const unsignalled = (value2) => !value2 || ["unknown", "unspecified", "reserved"].includes(value2);
  const color = [
    "-color_primaries",
    unsignalled(v.colorPrimaries) ? "bt709" : v.colorPrimaries,
    "-color_trc",
    unsignalled(v.colorTransfer) ? "bt709" : v.colorTransfer,
    "-colorspace",
    unsignalled(v.colorSpace) ? "bt709" : v.colorSpace
  ];
  return [
    ...head,
    "-filter_complex",
    graph.join(";"),
    "-map",
    "[v]",
    ...map,
    ...proxy?.width ? ["-c:v", "libx264", "-preset", "veryfast", "-crf", "23"] : ["-c:v", "prores_ks", "-profile:v", "2", "-vendor", "apl0"],
    ...color,
    "-r",
    String(spec.fps),
    "-fps_mode",
    "cfr",
    "-frames:v",
    String(frames),
    "-metadata:s:v:0",
    "rotate=0",
    out
  ];
}
async function verifyConform(tools, file, spec, oriented) {
  const problems = [];
  const frames = spec.toFrame - spec.fromFrame;
  const info = await probeStreams(tools, file);
  if (spec.hasAudio) {
    if (!info.audio) problems.push("no audio stream");
    else {
      if (info.audio.sampleRate !== spec.sampleRate) problems.push(`audio ${info.audio.sampleRate} Hz instead of ${spec.sampleRate}`);
      if (info.audio.channels < 2) problems.push(`${info.audio.channels} audio channel(s) instead of stereo`);
      const seconds2 = info.durationSeconds ? toNumberQ(info.durationSeconds) : 0;
      if (spec.audioOnly && Math.abs(seconds2 - frames / spec.fps) > 1 / spec.fps) problems.push(`audio lasts ${seconds2.toFixed(3)} s instead of ${(frames / spec.fps).toFixed(3)} s`);
    }
  }
  if (spec.audioOnly) return problems;
  if (!info.video || !oriented) return [...problems, "no video stream"];
  if (info.video.width !== oriented.width || info.video.height !== oriented.height) problems.push(`size ${info.video.width}x${info.video.height} instead of ${oriented.width}x${oriented.height}`);
  if (info.video.rotation % 360 !== 0) problems.push(`still carries a rotation of ${info.video.rotation}\xB0`);
  const pts = await probeFramePts(tools, file);
  if (pts.length !== frames) problems.push(`${pts.length} frames instead of ${frames}`);
  else {
    const fps = BigInt(spec.fps);
    const bad = pts.findIndex((value2, k) => value2.n * fps !== BigInt(k) * value2.d);
    if (bad >= 0) problems.push(`frame ${bad} is at ${formatRationalReadable(pts[bad])} s (not constant ${spec.fps} fps)`);
  }
  return problems;
}
var PROXY_DIR = "proxies";
var evenSize = (width, height) => width % 2 === 0 && height % 2 === 0;
function proxyFileName(mediaName) {
  const ext = path24.extname(mediaName).toLowerCase();
  const base = mediaName.slice(0, mediaName.length - path24.extname(mediaName).length);
  return `${base}_Proxy${[".mp4", ".mov", ".m4v"].includes(ext) ? ext : ".mov"}`;
}
function proxyDivisor(width, height, maxWidth, maxHeight) {
  const valid = [];
  for (let d = 1; d <= 16; d++) if (width % d === 0 && height % d === 0 && evenSize(width / d, height / d)) valid.push(d);
  return valid.find((d) => width / d <= maxWidth && height / d <= maxHeight) ?? valid[valid.length - 1] ?? 1;
}
function infoFromFacts(facts) {
  const v = facts.video;
  const swap = v ? Math.abs(v.rotation) % 180 === 90 : false;
  const rate = v?.frameRate ? parseRational(v.frameRate) : null;
  return {
    formatName: "recorded-facts",
    formatStart: rational(0),
    durationSeconds: parseRational(facts.durationSeconds),
    size: null,
    video: v ? {
      index: 0,
      codec: v.codec ?? "unknown",
      pixelFormat: v.pixelFormat ?? "unknown",
      storedWidth: swap ? v.height : v.width,
      storedHeight: swap ? v.width : v.height,
      width: v.width,
      height: v.height,
      rotation: v.rotation,
      timeBase: rational(1, 9e4),
      rFrameRate: rate,
      avgFrameRate: rate,
      sampleAspectRatio: v.sampleAspectRatio,
      colorTransfer: v.colorTransfer,
      colorPrimaries: v.colorPrimaries,
      colorSpace: v.colorSpace ?? null,
      colorRange: null,
      alpha: Boolean(v.alpha),
      frames: null
    } : null,
    audio: facts.audio ? { index: v ? 1 : 0, codec: facts.audio.codec ?? "unknown", sampleRate: facts.audio.sampleRate, channels: facts.audio.channels } : null
  };
}
var derivedChannels = (channels) => channels === 1 ? 2 : channels;
function predictedDerivedInfo(spec, source) {
  return {
    formatName: "predicted",
    formatStart: rational(0),
    durationSeconds: rational(spec.toFrame - spec.fromFrame, spec.fps),
    size: null,
    video: spec.audioOnly || !source.video ? null : { ...source.video, rotation: 0, rFrameRate: rational(spec.fps), avgFrameRate: rational(spec.fps), frames: spec.toFrame - spec.fromFrame },
    audio: spec.hasAudio && source.audio ? { index: 1, codec: "pcm_s16le", sampleRate: spec.sampleRate, channels: derivedChannels(source.audio.channels) } : null
  };
}
function proxyArgs(input, inputInfo, target, out) {
  const args = ["-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-i", input];
  const silence = Boolean(target.audio && !inputInfo.audio);
  if (silence) args.push("-f", "lavfi", "-i", `anullsrc=r=${target.audio.sampleRate}:cl=mono`);
  args.push("-map", "0:v:0");
  if (target.audio) args.push("-map", silence ? "1:a:0" : "0:a:0");
  args.push(
    "-vf",
    `scale=${target.width}:${target.height}:flags=bicubic,setsar=1`,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-pix_fmt",
    evenSize(target.width, target.height) ? "yuv420p" : "yuv444p",
    "-fps_mode",
    "passthrough",
    "-metadata:s:v:0",
    "rotate=0"
  );
  if (target.audio) args.push("-c:a", "aac", "-b:a", "128k", "-ac", String(target.audio.channels), "-ar", String(target.audio.sampleRate));
  else args.push("-an");
  if (silence) args.push("-shortest");
  if (/\.(mp4|m4v)$/i.test(out)) args.push("-movflags", "+faststart");
  args.push(out);
  return args;
}
async function verifyProxy(tools, file, expected) {
  const problems = [];
  const info = await probeStreams(tools, file);
  if (!info.video) return ["no video stream"];
  if (info.video.width !== expected.width || info.video.height !== expected.height) problems.push(`size ${info.video.width}x${info.video.height} instead of ${expected.width}x${expected.height}`);
  if ((info.audio?.channels ?? null) !== expected.channels) problems.push(`${info.audio?.channels ?? 0} audio channel(s) instead of ${expected.channels ?? 0}`);
  if (expected.durationSeconds && info.durationSeconds && Math.abs(toNumberQ(info.durationSeconds) - toNumberQ(expected.durationSeconds)) > 1.5 / expected.fps) {
    problems.push(`lasts ${toNumberQ(info.durationSeconds).toFixed(3)} s instead of ${toNumberQ(expected.durationSeconds).toFixed(3)} s`);
  }
  return problems;
}
async function verifyPremierePackage(dir) {
  const problems = [];
  const manifest = await readJsonFile(path24.join(dir, PACKAGE_MANIFEST)).catch(() => null);
  if (!manifest || manifest.kind !== "darkmind-premiere-package") return { dir, ok: false, manifest: null, problems: [`${PACKAGE_MANIFEST} is missing or not a Premiere package manifest`], checkedFiles: 0, pending: [] };
  const pendingMedia = new Set(manifest.media.filter((m) => m.state === "pending").map((m) => m.file));
  const pending = [];
  let checked = 0;
  for (const file of manifest.files) {
    const abs2 = path24.join(dir, ...file.path.split("/"));
    const stat = await fs26.stat(abs2).catch(() => null);
    if (!stat?.isFile()) {
      problems.push(`${file.path} is missing`);
      continue;
    }
    if (stat.size !== file.size) {
      problems.push(`${file.path} has ${stat.size} bytes instead of ${file.size}`);
      continue;
    }
    if ((await hashFile(abs2)).sha256 !== file.sha256) problems.push(`${file.path} differs from the manifest (SHA-256)`);
    checked++;
  }
  const xml = await fs26.readFile(path24.join(dir, manifest.sequence.file), "utf8").catch(() => null);
  if (xml !== null) {
    const listed2 = new Set(manifest.files.map((f) => f.path));
    for (const match of xml.matchAll(/<pathurl>([^<]*)<\/pathurl>/g)) {
      const url = match[1].replace(/&amp;/g, "&");
      if (/^[a-z]+:/i.test(url) || url.startsWith("/")) {
        problems.push(`${manifest.sequence.file} references an absolute path (${url}); packages use paths relative to the XML file`);
        continue;
      }
      const relPath = url.split("/").map(decodeURIComponent).join("/");
      if (listed2.has(relPath)) continue;
      if (pendingMedia.has(relPath)) {
        if (!pending.includes(relPath)) pending.push(relPath);
      } else problems.push(`${manifest.sequence.file} references ${relPath}, which is not in the manifest`);
    }
  }
  return { dir, ok: problems.length === 0, manifest, problems, checkedFiles: checked, pending: pending.sort() };
}
function importReport(m) {
  const lines = [];
  const seq = m.sequence;
  lines.push(`# Premiere Pro hand-off \u2013 ${m.project.title}`, "");
  lines.push(
    `Sequence **${seq.name}**: ${seq.width} \xD7 ${seq.height}, ${seq.fps.replace(/\/1$/, "")} fps, ${seq.frames} frames (${seq.durationSeconds} s), ${seq.sampleRate / 1e3} kHz stereo, starts at ${seq.startTimecode}. Created by darkmind-agent ${m.agentVersion} (exporter ${m.exporterVersion}).`,
    ""
  );
  lines.push("This is a one-way hand-off: changes made in Premiere are not transferred back into the Dark Mind pipeline.", "");
  lines.push("## Import (Premiere Pro, English UI)", "");
  m.importOrder.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
  lines.push("");
  lines.push("## What is editable", "");
  lines.push("| Part | In Premiere |", "|------|-------------|");
  const native = m.clips.filter((c) => c.editable === "native");
  const rendered = m.clips.filter((c) => c.editable === "rendered");
  lines.push(`| Cuts, B-roll, framing (Motion scale/position), separate audio tracks with levels | native (${native.length} clips) |`);
  if (m.captions.delivery === "srt") lines.push(`| Captions (${m.captions.count}) | native caption track from \`${m.captions.file}\` \u2013 text and timing editable |`);
  if (m.captions.delivery === "overlay") {
    lines.push(
      m.captions.overlay?.tracks.length ? `| Captions (${m.captions.count}) | **rendered overlay** on its own video track ${m.captions.overlay.tracks.join(", ")} (${m.captions.overlay.extensions.map((id2) => `"[rendered] ${id2}"`).join(", ")}; brand captions, exception T8) \u2013 no caption track: the clip can be moved, trimmed, disabled or faded, its text is corrected in captions.json and exported again |` : `| Captions (${m.captions.count}) | brand style, but **not on the timeline** \u2013 no captions in this package (T8: brand captions only as rendered overlay) |`
    );
  }
  for (const extension of m.extensions) {
    const what = extension.brand ? `brand block \`${extension.brand.block}\`, brand pack ${extension.brand.pack} ${extension.brand.version}` : `extension ${extension.version}`;
    const change = extension.brand ? "the brand layer is not changed in Premiere (T6); change its parameters in the pipeline and export again" : "picture/sound cannot be edited natively; change it in the pipeline and export again";
    lines.push(`| ${extension.id} (${what}) | **rendered media** \`${extension.media ?? extension.output}\` (label ${RENDERED_LABEL}, clip name "[rendered] ${extension.id}") \u2013 ${change} |`);
  }
  if (!rendered.length && !m.extensions.length) lines.push("| Rendered media | none |");
  lines.push("");
  if (m.deliverables.files.length || m.deliverables.notes.length) {
    lines.push("## Next to the sequence (not on a track)", "");
    for (const file of m.deliverables.files) lines.push(`- \`${file.file}\` \u2013 ${file.note} (from \`${file.from.file}\`)`);
    for (const note of m.deliverables.notes) lines.push(`- ${note}`);
    lines.push("");
  }
  if (m.loudness) {
    const l = m.loudness;
    lines.push("## Loudness", "");
    lines.push(l.note, "");
    if (l.finalRender) {
      const f = l.finalRender;
      lines.push(
        `Latest final render (\`${f.report}\`): the unmastered mix measured ${f.input.integratedLufs.toFixed(1)} LUFS / ${f.input.truePeakDbtp.toFixed(1)} dBTP; the master applied ${f.normalization === "linear" ? "one linear gain" : f.normalization === "limited" ? "one gain and a peak limiter" : "nothing (silent mix)"}${f.correctionDb ? ` plus a correction of ${f.correctionDb >= 0 ? "+" : ""}${f.correctionDb.toFixed(2)} dB` : ""}${f.output ? ` and reached ${f.output.integratedLufs.toFixed(1)} LUFS / ${f.output.truePeakDbtp.toFixed(1)} dBTP` : ""}${f.check ? ` (loudness check ${f.check})` : ""}.`,
        ""
      );
    }
    lines.push(
      `In Premiere: File > Export > Media, section **Effects** > **Loudness Normalization** on: Loudness Standard ITU BS.1770-3, Target Loudness ${l.target.integratedLufs} LUFS, Tolerance ${l.target.toleranceLu} LU, Max True Peak Level ${l.target.truePeakDbtp} dBTP. Check the result with the Loudness Meter (Effects > Audio Effects > Special) on the Mix track.`
    );
    if (l.ducking && l.musicTracks.length) lines.push("", `The render lowers the music (track ${l.musicTracks.join(", ")}) by ${l.ducking.underDialogDb} dB under dialog with ${l.ducking.rampSeconds} s ramps; the package keeps the music at its clip level \u2013 duck it in Premiere (Essential Sound > Music > Ducking, or volume keyframes).`);
    lines.push("");
  }
  if (m.mode === "proxy") {
    const open = m.media.filter((media) => media.state && media.state !== "final");
    lines.push("## Proxy workflow (hi-res later)", "");
    if (m.hiresFill?.status === "complete") {
      lines.push(`The hi-res media are in \`media/\` (export hires${m.hiresFill.filledAt ? `, ${m.hiresFill.filledAt}` : ""}). Open the Premiere project again; if a clip still shows the proxy, use **Toggle Proxies** (off) or right-click > Proxy > Reconnect Full Resolution Media\u2026 / Link Media\u2026 and point to \`media/\`. The proxies in \`${PROXY_DIR}/\` may stay attached.`, "");
    } else {
      lines.push(
        `This package was exported before the originals were downloaded. Premiere works on the proxies in \`${PROXY_DIR}/\`; the hi-res files follow later into \`media/\` under the names the XML already uses. **Do not make the final export before the hi-res media are in place:** while a hi-res file is missing, Premiere exports from the proxy without a warning (also with proxies off).`,
        ""
      );
      lines.push("| Medium | State | Proxy |", "|--------|-------|-------|");
      for (const media of open) {
        const state = media.state === "pending" ? "hi-res follows (offline until then)" : media.state === "placeholder" ? "placeholder sound from the proxy, replaced by the hi-res sound" : "rendered from proxies, replaced by the hi-res render";
        lines.push(`| \`${media.file}\` | ${state} | ${media.proxy ? `\`${media.proxy.file}\` (${media.proxy.width} \xD7 ${media.proxy.height}, 1/${media.proxy.divisor})` : "\u2013"} |`);
      }
      lines.push("");
    }
  }
  const conforms = m.media.filter((media) => media.conform);
  if (conforms.length) {
    lines.push("## Conform media (rules C1, mono and gain)", "");
    lines.push(`Premiere ignores the rotation matrix of MP4 files and plays variable frame rate media with its own timing. These sources are delivered as constant-frame-rate ProRes 422 files with PCM sound (physically rotated, same frames as the render); the clips keep their cut points and handles for trimming. Premiere plays a mono file on a stereo track on the left channel only, so mono sound is delivered as stereo PCM (the mono channel on both sides, like the render). Premiere accepts clip volume levels up to +${PREMIERE_MAX_LEVEL_DB} dB, so for higher gains the part above it is applied to the delivered stereo PCM sound (reason gain).`, "");
    lines.push("| File | Source | Reason | Original range (s) | Frames |", "|------|--------|--------|--------------------|--------|");
    for (const media of conforms) {
      const c = media.conform;
      lines.push(`| \`${media.file}\` | ${media.sourceId}${media.videoId ? ` (${media.videoId})` : ""} | ${c.reasons.map((r) => r === "gain" ? `gain +${c.gainDb} dB` : r).join(", ")} | ${c.fromSeconds}\u2013${c.toSeconds} | ${c.frames} |`);
    }
    lines.push("");
  }
  lines.push("## Compatibility", "");
  lines.push(`Verified with ${m.compatibility.verifiedWith}; other versions are not tested.`, "");
  for (const note of m.compatibility.notes) lines.push(`- ${note}`);
  lines.push("");
  lines.push("## Reviews", "");
  lines.push(m.reviews.note, "");
  for (const approval of m.reviews.approvals) lines.push(`- ${approval.subject}: \`${approval.file}\` (hash ${approval.hash.slice(0, 12)})`);
  lines.push("");
  lines.push(`Media and hashes: \`${PACKAGE_MANIFEST}\`. Check the folder after copying with \`darkmind-agent export verify <folder>\`.`, "");
  return lines.join("\n");
}
async function exportPremierePackage(request) {
  const { root, tools } = request;
  const progress = request.progress ?? (() => {
  });
  const proxyMode = Boolean(request.proxy);
  const handleSeconds = request.handleSeconds ?? DEFAULT_CONFORM_HANDLE_SECONDS;
  if (!(Number.isFinite(handleSeconds) && handleSeconds >= 0 && handleSeconds <= 600)) throw new CliError("invalid-input", "--handles must be between 0 and 600 seconds");
  const rendersDir = path24.join(root, "renders");
  const release = await acquireLock(path24.join(rendersDir, ".lock"));
  const workDir = path24.join(rendersDir, RENDER_DIRS.tmp, `premiere-${Date.now()}-${process.pid}`);
  try {
    const detected = await detectToolchain(tools, request.env, { needFont: false });
    if (!detected.toolchain) throw new PreflightError("preflight-failed", detected.problems.map((p) => p.message).join("; "), { issues: detected.problems.map((p) => ({ severity: "error", ...p })) });
    const toolchain = detected.toolchain;
    const binding = toolchainBinding(toolchainDocument(toolchain, null));
    const override = binding ? { ffmpeg: binding.ffmpeg } : void 0;
    let gate = null;
    if (request.reviewGates !== false) gate = (await requireReviewGate(root, "export", { toolchain: override })).gate;
    let extensionResults = [];
    if (request.extensions !== false) {
      const summary3 = await runExtensions({ root, mode: proxyMode ? "proxy" : "original", tools, env: request.env, neededOnly: true, signal: request.signal, progress });
      if (!summary3.ok) throw extensionsError(summary3);
      extensionResults = summary3.results.map(({ id: id2, action, key, sha256: sha2563, output }) => ({ id: id2, action, key, sha256: sha2563, output }));
    }
    const hashCache = await HashCache.load(mediaHashCachePath(root));
    const planned = await buildExecutionPlan({ root, mode: "original", tools, hashes: { cache: hashCache, computeOriginals: true }, signal: request.signal, virtualOriginals: proxyMode });
    let state = null;
    if (gate && planned.validation.documents) {
      state = await computeReviewState(root, { validation: planned.validation, toolchain: override });
      const again = evaluateGate(state, "export");
      if (again.status === "blocked") throw gateError(again);
      gate = again;
    }
    const issues = [...planned.issues];
    for (const problem of detected.problems) issues.push({ severity: "error", ...problem });
    const completeProxies = /* @__PURE__ */ new Map();
    for (const file of proxyMode ? (planned.plan?.files ?? []).filter((f) => f.virtual) : []) {
      const { candidates } = await proxyCandidates(path24.join(root, "media", "proxy"), file.videoId);
      const full = candidates.find((c) => c.kind === "full" && c.offset.n === 0n);
      if (full) completeProxies.set(file.id, { file: full.file, info: await probeStreams(tools, full.file, { signal: request.signal }) });
      else {
        issues.push({ severity: "error", code: "proxy-missing", message: `export premiere --proxy needs the complete proxy of source "${file.sourceId}" (${file.videoId}): Premiere attaches only proxies as long as the original`, ref: file.sourceId });
        planned.needs.push({ videoId: file.videoId, sourceId: file.sourceId, kind: "proxy", ranges: null, hint: `get_media_sources(kind proxy, ${file.videoId}) \u2192 darkmind-agent media <ticket>` });
      }
    }
    const plan = planned.plan;
    const docs = planned.validation.documents;
    const conformSources = new Map(planned.validation.conform.map((c) => [c.sourceId, c.reasons]));
    if (conformSources.size) {
      const listed2 = await tools.run(tools.ffmpeg, ["-hide_banner", "-encoders"], { timeoutMs: 3e4 });
      const missing = CONFORM_ENCODERS.filter((name) => !new RegExp(`^\\s*\\S+\\s+${name}\\s`, "m").test(listed2.stdout));
      if (missing.length) issues.push({ severity: "error", code: "ffmpeg-features-missing", message: `conform media (rule C1) need the encoders ${missing.join(", ")}; use a full ffmpeg build` });
    }
    const errors = issues.filter((issue) => issue.severity === "error");
    if (!plan || !docs || errors.length) {
      throw new PreflightError("preflight-failed", `Preflight failed: ${errors.map((e) => `${e.ref ? `${e.ref}: ` : ""}${e.message}`).slice(0, 5).join("; ")}${errors.length > 5 ? ` (+${errors.length - 5} more)` : ""}`, {
        issues,
        needs: planned.needs
      });
    }
    const fps = parseRational(plan.output.fps);
    if (fps.d !== 1n) throw new CliError("invalid-input", `the Premiere export supports whole frame rates only (${plan.output.fps})`);
    const rate = Number(fps.n);
    const W = plan.output.width;
    const H = plan.output.height;
    await fs26.mkdir(workDir, { recursive: true });
    const staging = path24.join(workDir, "package");
    await fs26.mkdir(path24.join(staging, "media"), { recursive: true });
    if (proxyMode) await fs26.mkdir(path24.join(staging, PROXY_DIR), { recursive: true });
    const sources = new Map((docs.sources?.sources ?? []).map((s) => [s.id, s]));
    const usedNames = /* @__PURE__ */ new Set();
    const unique = (name) => {
      const ext = path24.extname(name);
      const base2 = name.slice(0, name.length - ext.length);
      let candidate = name;
      for (let i = 2; usedNames.has(candidate.toLowerCase()); i++) candidate = `${base2}-${i}${ext}`;
      usedNames.add(candidate.toLowerCase());
      return candidate;
    };
    const fileSha = async (file) => file.sha256 ?? (file.sha256 = await hashCache.hash(file.path, path24.join(root, ...file.path.split("/")), file.size, file.mtimeMs));
    const allClips = [...plan.video.flatMap((t) => t.clips), ...plan.audio.flatMap((t) => t.clips)];
    const mediaByFile = /* @__PURE__ */ new Map();
    const audioByFile = /* @__PURE__ */ new Map();
    const media = [];
    const conformDir = path24.join(rendersDir, RENDER_DIRS.cache, "conform");
    const keepConform = /* @__PURE__ */ new Set();
    const xmemlFile = (file, name, info, timebase) => ({
      path: file,
      name,
      timebase,
      ntsc: false,
      durationSeconds: info.durationSeconds ?? rational(0),
      video: info.video ? { width: info.video.width, height: info.video.height } : null,
      audio: info.audio ? { sampleRate: info.audio.sampleRate, channels: info.audio.channels } : null
    });
    const nominal = (info) => {
      const r = info.video?.rFrameRate;
      if (!r || r.n === 0n) return { timebase: rate, ntsc: false };
      const value2 = toNumberQ(r);
      if (r.d === 1001n) return { timebase: Math.round(value2), ntsc: true };
      return { timebase: Math.max(1, Math.round(value2)), ntsc: false };
    };
    const derive2 = async (file, abs2, info, sha2563, spec) => {
      const ext = spec.audioOnly ? "wav" : "mov";
      const key = sha256Hex(JSON.stringify({ version: CONFORM_VERSION, original: sha2563, spec, ffmpeg: toolchain.ffmpeg }));
      const cached = path24.join(conformDir, `${key}.${ext}`);
      keepConform.add(cached);
      let entry = await cachedEntry(cached);
      if (!entry) {
        progress(`${spec.audioOnly ? "stereo audio" : "conform"} ${spec.sourceId} (${spec.reasons.join(", ")}, frames ${spec.fromFrame}-${spec.toFrame})`);
        const temp = path24.join(workDir, `conform-${spec.sourceId}.${ext}`);
        const result = await tools.run(tools.ffmpeg, conformArgs(spec, abs2, info, temp), { cwd: workDir, signal: request.signal, timeoutMs: 6 * 60 * 6e4 });
        if (result.code !== 0) throw new CliError("ffmpeg-failed", `conform of source "${spec.sourceId}" failed: ${result.stderr.trim().split(/\r?\n/).slice(-3).join(" | ")}`);
        const problems = await verifyConform(tools, temp, spec, info.video ? { width: info.video.width, height: info.video.height } : null);
        if (problems.length) throw new CliError("conform-verification-failed", `conform of source "${spec.sourceId}" does not match the plan: ${problems.join("; ")}`, { problems });
        entry = await storeEntry(temp, cached, spec.toFrame - spec.fromFrame);
      }
      const name = unique(`${safeName(spec.sourceId, "source", 40)}-${spec.audioOnly ? "stereo-audio" : `conform-${rate}p`}-${spec.fromFrame}-${spec.toFrame}.${ext}`);
      const target2 = path24.join(staging, "media", name);
      const placed = await placeFile(cached, target2);
      const derivedInfo = await probeStreams(tools, target2, { signal: request.signal });
      const packageMedia = {
        file: `media/${name}`,
        role: spec.audioOnly ? "stereo-audio" : "conform",
        editable: "native",
        sourceId: spec.sourceId,
        ...file.videoId ? { videoId: file.videoId } : {},
        size: entry.size,
        sha256: entry.sha256,
        placed,
        from: { file: file.path, sha256: sha2563 },
        ...proxyMode ? { state: "final" } : {},
        conform: {
          rule: spec.audioOnly ? spec.reasons.includes("mono") ? "mono" : "gain" : "C1",
          reasons: spec.reasons,
          ...spec.gainDb ? { gainDb: spec.gainDb } : {},
          fromSeconds: formatRationalReadable(framesToSeconds(spec.fromFrame, fps), 6),
          toSeconds: formatRationalReadable(framesToSeconds(spec.toFrame, fps), 6),
          frames: spec.toFrame - spec.fromFrame,
          rate: `${rate}/1`,
          video: spec.audioOnly ? null : "ProRes 422 10-bit, constant frame rate, physically rotated",
          audio: spec.hasAudio ? `PCM 16-bit ${spec.sampleRate} Hz stereo` : null,
          handleSeconds
        }
      };
      media.push(packageMedia);
      return { entry: packageMedia, xmeml: xmemlFile(packageMedia.file, name, derivedInfo, rate), offsetFrames: spec.fromFrame, gainDb: spec.gainDb ?? 0 };
    };
    const makeProxy = async (mediaName, hires, divisor, build, sourceId) => {
      const name = proxyFileName(mediaName);
      const temp = path24.join(workDir, `proxy-${name}`);
      progress(`proxy ${name} (1/${divisor} of ${hires.width}x${hires.height})`);
      const result = await tools.run(tools.ffmpeg, build(temp), { cwd: workDir, signal: request.signal, timeoutMs: 6 * 60 * 6e4 });
      if (result.code !== 0) throw new CliError("ffmpeg-failed", `proxy of source "${sourceId}" failed: ${result.stderr.trim().split(/\r?\n/).slice(-3).join(" | ")}`);
      const problems = await verifyProxy(tools, temp, { ...hires, width: hires.width / divisor, height: hires.height / divisor });
      if (problems.length) throw new CliError("proxy-verification-failed", `the proxy of source "${sourceId}" does not match its hi-res medium: ${problems.join("; ")}`, { problems });
      const target2 = path24.join(staging, PROXY_DIR, name);
      await renameWithRetry(temp, target2);
      const { sha256: sha2563, size } = await hashFile(target2);
      return { file: `${PROXY_DIR}/${name}`, size, sha256: sha2563, width: hires.width / divisor, height: hires.height / divisor, divisor };
    };
    const divisorFor = (width, height, proxy) => proxyDivisor(width, height, Math.max(proxy.video?.width ?? width, 2), Math.max(proxy.video?.height ?? height, 2));
    const pendingOriginal = async (file, info, name, sha2563, sourceId) => {
      const source = completeProxies.get(file.id);
      const facts = sources.get(file.sourceId).media;
      let proxy;
      if (info.video) {
        const d = divisorFor(info.video.width, info.video.height, source.info);
        const target2 = { width: info.video.width / d, height: info.video.height / d, audio: info.audio ? { sampleRate: info.audio.sampleRate, channels: info.audio.channels } : null };
        proxy = await makeProxy(name, { width: info.video.width, height: info.video.height, channels: info.audio?.channels ?? null, durationSeconds: info.durationSeconds, fps: toNumberQ(info.video.rFrameRate ?? rational(rate)) }, d, (out) => proxyArgs(source.file, source.info, target2, out), file.sourceId);
      }
      const entry = {
        file: `media/${name}`,
        role: "original",
        editable: "native",
        ...sourceId ? { sourceId } : {},
        ...file.videoId ? { videoId: file.videoId } : {},
        size: file.size,
        sha256: sha2563,
        from: { file: file.path, sha256: sha2563 },
        state: "pending",
        ...proxy ? { proxy } : {},
        hires: { facts }
      };
      media.push(entry);
      return entry;
    };
    const derivePending = async (file, info, spec) => {
      const source = completeProxies.get(file.id);
      const ext = spec.audioOnly ? "wav" : "mov";
      const name = unique(`${safeName(spec.sourceId, "source", 40)}-${spec.audioOnly ? "stereo-audio" : `conform-${rate}p`}-${spec.fromFrame}-${spec.toFrame}.${ext}`);
      const channels2 = derivedChannels(info.audio?.channels ?? 2);
      const conform = {
        rule: spec.audioOnly ? spec.reasons.includes("mono") ? "mono" : "gain" : "C1",
        reasons: spec.reasons,
        ...spec.gainDb ? { gainDb: spec.gainDb } : {},
        fromSeconds: formatRationalReadable(framesToSeconds(spec.fromFrame, fps), 6),
        toSeconds: formatRationalReadable(framesToSeconds(spec.toFrame, fps), 6),
        frames: spec.toFrame - spec.fromFrame,
        rate: `${rate}/1`,
        video: spec.audioOnly ? null : "ProRes 422 10-bit, constant frame rate, physically rotated",
        audio: spec.hasAudio ? `PCM 16-bit ${spec.sampleRate} Hz stereo` : null,
        handleSeconds
      };
      const facts = sources.get(file.sourceId).media;
      if (spec.audioOnly) {
        progress(`placeholder sound ${name} (from the proxy)`);
        const temp = path24.join(workDir, `placeholder-${name}`);
        const result = await tools.run(tools.ffmpeg, conformArgs(spec, source.file, source.info, temp, { channels: channels2 }), { cwd: workDir, signal: request.signal, timeoutMs: 60 * 6e4 });
        if (result.code !== 0) throw new CliError("ffmpeg-failed", `placeholder sound of source "${spec.sourceId}" failed: ${result.stderr.trim().split(/\r?\n/).slice(-3).join(" | ")}`);
        const target2 = path24.join(staging, "media", name);
        await renameWithRetry(temp, target2);
        const { sha256: sha2563, size } = await hashFile(target2);
        const entry2 = { file: `media/${name}`, role: "stereo-audio", editable: "native", sourceId: spec.sourceId, ...file.videoId ? { videoId: file.videoId } : {}, size, sha256: sha2563, placed: "copy", from: { file: file.path, sha256: file.sha256 ?? "" }, conform, state: "placeholder", hires: { spec, facts } };
        media.push(entry2);
        return { entry: entry2, xmeml: xmemlFile(entry2.file, name, await probeStreams(tools, target2, { signal: request.signal }), rate), offsetFrames: spec.fromFrame, gainDb: spec.gainDb ?? 0 };
      }
      const oriented = info.video;
      const d = divisorFor(oriented.width, oriented.height, source.info);
      const proxy = await makeProxy(
        name,
        { width: oriented.width, height: oriented.height, channels: spec.hasAudio ? channels2 : null, durationSeconds: rational(spec.toFrame - spec.fromFrame, spec.fps), fps: rate },
        d,
        (out) => conformArgs(spec, source.file, source.info, out, { width: oriented.width / d, height: oriented.height / d, channels: channels2 }),
        spec.sourceId
      );
      const entry = { file: `media/${name}`, role: "conform", editable: "native", sourceId: spec.sourceId, ...file.videoId ? { videoId: file.videoId } : {}, size: 0, sha256: "", from: { file: file.path, sha256: file.sha256 ?? "" }, conform, state: "pending", proxy, hires: { spec, facts } };
      media.push(entry);
      return { entry, xmeml: xmemlFile(entry.file, name, predictedDerivedInfo(spec, info), rate), offsetFrames: spec.fromFrame, gainDb: spec.gainDb ?? 0 };
    };
    for (const file of plan.files) {
      if (!allClips.some((clip) => clip.file === file.id)) continue;
      const abs2 = path24.join(root, ...file.path.split("/"));
      const virtual = Boolean(file.virtual);
      const info = virtual ? infoFromFacts(sources.get(file.sourceId).media) : await probeStreams(tools, abs2, { signal: request.signal });
      const sha2563 = virtual ? file.sha256 ?? "" : await fileSha(file);
      const sourceId = file.sourceId;
      const clips = allClips.filter((clip) => clip.file === file.id);
      const source = sourceId ? sources.get(sourceId) : void 0;
      const facts = source?.media ?? null;
      const range2 = () => conformRange(clips, rate, facts?.durationSeconds ? parseRational(facts.durationSeconds) : info.durationSeconds, handleSeconds);
      const mono = info.audio?.channels === 1;
      const audioGains = clips.filter((clip) => clip.kind === "audio").map((clip) => clip.gainDb ?? 0);
      const boost = audioGains.length ? Math.max(0, Math.round((Math.max(...audioGains) - PREMIERE_MAX_LEVEL_DB) * 100) / 100) : 0;
      const gainSpec = boost > 0 ? { gainDb: boost } : {};
      const reasons = sourceId ? conformSources.get(sourceId) : void 0;
      if (reasons && info.video) {
        const spec = { sourceId, reasons: [...reasons, ...mono ? ["mono"] : [], ...boost > 0 ? ["gain"] : []], ...gainSpec, ...range2(), fps: rate, sampleRate: plan.output.sampleRate, hasAudio: Boolean(info.audio) };
        const derived = virtual ? await derivePending(file, info, spec) : await derive2(file, abs2, info, sha2563, spec);
        mediaByFile.set(file.id, derived);
        audioByFile.set(file.id, derived);
        continue;
      }
      if (clips.some((clip) => clip.kind === "video")) {
        const ext = path24.extname(file.path).toLowerCase();
        const baseName = file.role === "extension" ? `rendered-${safeName(file.extensionId ?? "extension", "extension", 40)}` : `${safeName(sourceId ?? "source", "source", 40)}-${safeName(path24.parse(source && source.kind === "darkmind-video" ? source.fileName ?? source.videoId : path24.basename(file.path)).name, "media", 50)}`;
        const name = unique(`${baseName}${ext}`);
        let packageMedia;
        if (virtual) packageMedia = await pendingOriginal(file, info, name, sha2563, sourceId);
        else {
          const placed = await placeFile(abs2, path24.join(staging, "media", name));
          const role = file.role === "extension" ? "extension" : file.role === "asset" ? "asset" : "original";
          packageMedia = {
            file: `media/${name}`,
            role,
            editable: role === "extension" ? "rendered" : "native",
            ...sourceId ? { sourceId } : {},
            ...file.videoId ? { videoId: file.videoId } : {},
            ...file.extensionId ? { extensionId: file.extensionId } : {},
            size: file.size,
            sha256: sha2563,
            placed,
            from: { file: file.path, sha256: sha2563 },
            ...proxyMode ? { state: "final" } : {}
          };
          media.push(packageMedia);
        }
        const { timebase, ntsc } = nominal(info);
        mediaByFile.set(file.id, { entry: packageMedia, xmeml: { ...xmemlFile(packageMedia.file, name, info, info.video ? timebase : rate), ntsc: info.video ? ntsc : false }, offsetFrames: 0 });
      }
      if (!clips.some((clip) => clip.kind === "audio")) continue;
      if (mono || boost > 0) {
        const spec = { sourceId: sourceId ?? file.extensionId ?? "audio", reasons: [...mono ? ["mono"] : [], ...boost > 0 ? ["gain"] : []], ...gainSpec, ...range2(), fps: rate, sampleRate: plan.output.sampleRate, hasAudio: true, audioOnly: true };
        audioByFile.set(file.id, virtual ? await derivePending(file, info, spec) : await derive2(file, abs2, info, sha2563, spec));
      } else if (mediaByFile.has(file.id)) {
        audioByFile.set(file.id, mediaByFile.get(file.id));
      } else {
        const name = unique(`${safeName(sourceId ?? file.extensionId ?? "audio", "audio", 40)}-${safeName(path24.parse(file.path).name, "media", 50)}${path24.extname(file.path).toLowerCase()}`);
        if (virtual) {
          const pending = await pendingOriginal(file, info, name, sha2563, sourceId);
          audioByFile.set(file.id, { entry: pending, xmeml: xmemlFile(pending.file, name, info, rate), offsetFrames: 0 });
          continue;
        }
        const placed = await placeFile(abs2, path24.join(staging, "media", name));
        const role = file.role === "extension" ? "extension" : file.role === "asset" ? "asset" : "original";
        const packageMedia = {
          file: `media/${name}`,
          role,
          editable: role === "extension" ? "rendered" : "native",
          ...sourceId ? { sourceId } : {},
          ...file.videoId ? { videoId: file.videoId } : {},
          ...file.extensionId ? { extensionId: file.extensionId } : {},
          size: file.size,
          sha256: sha2563,
          placed,
          from: { file: file.path, sha256: sha2563 },
          ...proxyMode ? { state: "final" } : {}
        };
        media.push(packageMedia);
        audioByFile.set(file.id, { entry: packageMedia, xmeml: xmemlFile(packageMedia.file, name, info, rate), offsetFrames: 0 });
      }
    }
    await hashCache.save();
    if (proxyMode) {
      const rendered = media.filter((m) => m.role === "extension" && m.extensionId);
      const ids = [...new Set(rendered.map((m) => m.extensionId))];
      const inspection = ids.length ? await inspectExtensions({ root, mode: "proxy", tools, env: request.env, only: ids }) : { states: [] };
      for (const m of rendered) {
        if (inspection.states.find((state2) => state2.id === m.extensionId)?.modeDependent) {
          m.state = "proxy-render";
          m.hires = { extensionId: m.extensionId };
        }
      }
    }
    const timelineClips = new Map([...(docs.timeline?.video ?? []).flatMap((t) => t.clips), ...(docs.timeline?.audio ?? []).flatMap((t) => t.clips)].map((c) => [c.id, c]));
    const packageClips = [];
    const inMedia = (clip, offsetFrames) => subQ(parseRational(clip.inExec), rational(offsetFrames, rate));
    const delivery = captionDelivery(docs.captions);
    const captionExtensions = delivery === "overlay" ? captionOverlayExtensions(docs) : /* @__PURE__ */ new Set();
    const premiereTracks = premiereVideoTracks(plan.video, captionExtensions);
    const videoTracks = premiereTracks.map(
      ({ track, clips, captions: captionTrack }, ti) => clips.map((clip) => {
        const m = mediaByFile.get(clip.file);
        const inFile = inMedia(clip, m.offsetFrames);
        const rendered = m.entry.role === "extension";
        const tl = timelineClips.get(clip.id);
        let motion = { scalePercent: 100, positionX: W / 2, positionY: H / 2, centerX: 0, centerY: 0 };
        if (tl?.crop && clip.crop) {
          const g = cropGeometry(parseCrop(tl.crop), clip.crop.basis.width, clip.crop.basis.height, W, H);
          motion = { scalePercent: g.premiere.scalePercent, positionX: g.premiere.positionX, positionY: g.premiere.positionY, centerX: g.premiere.centerX, centerY: g.premiere.centerY };
        }
        packageClips.push({
          id: clip.id,
          track: track.id,
          premiereTrack: `V${ti + 1}`,
          kind: "video",
          editable: rendered ? "rendered" : "native",
          media: m.entry.file,
          ...clip.sourceId ? { sourceId: clip.sourceId } : {},
          ...clip.extensionId ? { extensionId: clip.extensionId } : {},
          ...clip.statementId ? { statementId: clip.statementId } : {},
          ...clip.sceneId ? { sceneId: clip.sceneId } : {},
          ...clip.brollId ? { brollId: clip.brollId } : {},
          start: clip.start,
          end: clip.end,
          startTimecode: frameTimecode(clip.start, fps),
          inExec: clip.inExec,
          inMedia: formatRationalReadable(inFile, 9),
          pproTicksIn: String(toTicks(inFile)),
          premiere: { scalePercent: round3(motion.scalePercent, 6), positionX: round3(motion.positionX, 4), positionY: round3(motion.positionY, 4), centerX: round3(motion.centerX, 9), centerY: round3(motion.centerY, 9) },
          ...captionTrack ? { captionOverlay: true } : {}
        });
        return {
          key: clip.id,
          name: rendered ? `[rendered] ${clip.extensionId}` : m.xmeml.name,
          file: m.xmeml,
          start: clip.start,
          frames: clip.frames,
          inExec: inFile,
          link: clip.id,
          label: rendered ? RENDERED_LABEL : null,
          alpha: Boolean(clip.alpha),
          scalePercent: motion.scalePercent,
          centerX: motion.centerX,
          centerY: motion.centerY
        };
      })
    );
    const linkedVideo = new Set(plan.video.flatMap((t) => t.clips.map((c) => c.id)));
    const musicTracks = [];
    let audioIndex = 0;
    const audioTracks = plan.audio.map((track) => {
      audioIndex++;
      if (track.role === "music" && track.clips.length) musicTracks.push(`A${audioIndex}`);
      return track.clips.map((clip) => {
        const m = audioByFile.get(clip.file);
        const inFile = inMedia(clip, m.offsetFrames);
        const rendered = m.entry.role === "extension";
        const linkedTo = timelineClips.get(clip.id)?.linkedTo;
        packageClips.push({
          id: clip.id,
          track: track.id,
          premiereTrack: `A${audioIndex}`,
          kind: "audio",
          editable: rendered ? "rendered" : "native",
          media: m.entry.file,
          ...clip.sourceId ? { sourceId: clip.sourceId } : {},
          ...clip.extensionId ? { extensionId: clip.extensionId } : {},
          ...clip.statementId ? { statementId: clip.statementId } : {},
          ...clip.sceneId ? { sceneId: clip.sceneId } : {},
          ...clip.brollId ? { brollId: clip.brollId } : {},
          start: clip.start,
          end: clip.end,
          startTimecode: frameTimecode(clip.start, fps),
          inExec: clip.inExec,
          inMedia: formatRationalReadable(inFile, 9),
          pproTicksIn: String(toTicks(inFile)),
          gainDb: clip.gainDb ?? 0,
          ...m.gainDb ? { premiereLevelDb: (clip.gainDb ?? 0) - m.gainDb } : {},
          ...linkedTo ? { linkedTo } : {}
        });
        return {
          key: clip.id,
          name: rendered ? `[rendered] ${clip.extensionId}` : m.xmeml.name,
          file: m.xmeml,
          start: clip.start,
          frames: clip.frames,
          inExec: inFile,
          link: linkedTo && linkedVideo.has(linkedTo) ? linkedTo : clip.id,
          label: rendered ? RENDERED_LABEL : null,
          gainDb: (clip.gainDb ?? 0) - (m.gainDb ?? 0)
        };
      });
    });
    const markers = draftMarkers(docs, plan);
    const title = docs.project.title?.trim() || "Dark Mind edit";
    const base = safeName(title, "darkmind-edit", 60);
    const xmlName = `${base}.xml`;
    const srtName = delivery === "srt" ? `${base}.srt` : null;
    const srt = srtName ? captionsToSrt(plan.captions, fps) : null;
    const sequenceModel = { name: title, uuid: "", width: W, height: H, fps: rate, sampleRate: plan.output.sampleRate, totalFrames: plan.totalFrames, video: videoTracks, audio: audioTracks, markers };
    sequenceModel.uuid = uuidFromHash(sha256Hex(JSON.stringify(sequenceModel, (_k, v) => typeof v === "bigint" ? String(v) : v)));
    const xml = buildXmeml(sequenceModel);
    const brandPack = await detectBrandPack(root);
    const extensionsById = new Map(docs.extensions.map((e) => [e.id, e]));
    const usedExtensions = [...new Set(allClips.map((c) => c.extensionId).filter((id2) => Boolean(id2)))];
    const extensions = usedExtensions.map((id2) => {
      const definition = extensionsById.get(id2);
      const result = extensionResults.find((r) => r.id === id2);
      const packaged = media.find((m) => m.extensionId === id2);
      const brand = brandBlockOf(definition, brandPack);
      return {
        id: id2,
        version: definition.version,
        output: definition.output.path,
        sha256: packaged?.sha256 ?? result?.sha256 ?? null,
        action: result?.action ?? "used-as-is",
        media: packaged?.file ?? null,
        editable: "rendered",
        brand,
        note: brand ? `brand block ${brand.block} of brand pack ${brand.pack} ${brand.version} (brand layer, T6): rendered media, not native Premiere effects; change its parameters in the pipeline (add-block) and export again` : "rendered media (F4): the content is a finished picture/sound, not native Premiere effects; its source stays in extensions/ for re-rendering"
      };
    });
    const captionTracks = premiereTracks.flatMap((t, index) => t.captions ? [`V${index + 1}`] : []);
    const captionOverlay = delivery === "overlay" ? { extensions: [...new Set(premiereTracks.flatMap((t) => t.captions ? t.clips.map((c) => c.extensionId) : []))], tracks: captionTracks } : null;
    const reserved = new Set([xmlName, srtName, PACKAGE_REPORT, PACKAGE_MANIFEST, "media", PROXY_DIR].filter((n) => Boolean(n)).map((n) => n.toLowerCase()));
    const rootName = (wanted) => {
      const ext = path24.extname(wanted).toLowerCase();
      const stem = safeName(path24.basename(wanted, path24.extname(wanted)), "file", 60);
      let name = `${stem}${ext}`;
      for (let i = 2; reserved.has(name.toLowerCase()); i++) name = `${stem}-${i}${ext}`;
      reserved.add(name.toLowerCase());
      return name;
    };
    const deliverables = [];
    const deliverableNotes = [];
    const copyDeliverable = async (from, name) => {
      await fs26.copyFile(path24.join(root, ...from.split("/")), path24.join(staging, name));
      return hashFile(path24.join(staging, name));
    };
    const stills = docs.extensions.filter((e) => e.output.image === true);
    if (stills.length && proxyMode) {
      deliverableNotes.push(`Thumbnail${stills.length > 1 ? "s" : ""} ${stills.map((still) => still.id).join(", ")}: not in a proxy package \u2013 the deliverable PNG comes from the original (darkmind-agent extensions run <id> --original after the thumbnail review); export a full package or add it by hand.`);
    } else if (stills.length) {
      const inspection = await inspectExtensions({ root, mode: "original", tools, env: request.env, only: stills.map((s) => s.id) });
      const stillGate = state ? evaluateGate(state, "still-original") : null;
      for (const still of stills) {
        const current = inspection.states.find((s) => s.id === still.id);
        const fromOriginal = current && current.status === "current" && current.output.exists && (!current.modeDependent || current.record?.mode === "original");
        if (stillGate && stillGate.status !== "passed") {
          deliverableNotes.push(`Thumbnail ${still.id} is not included: its thumbnail review is missing or out of date (darkmind-agent review show thumbnail, then extensions run ${still.id} --original).`);
        } else if (!fromOriginal || !current?.output.sha256) {
          deliverableNotes.push(`Thumbnail ${still.id} is not included: the deliverable PNG from the original is missing or out of date (darkmind-agent extensions run ${still.id} --original after the thumbnail review).`);
        } else {
          const name = rootName(path24.basename(still.output.path));
          const { sha256: sha2563, size } = await copyDeliverable(still.output.path, name);
          deliverables.push({ file: name, kind: "thumbnail", extensionId: still.id, size, sha256: sha2563, from: { file: still.output.path, sha256: current.output.sha256 }, note: `YouTube thumbnail ${still.output.width} \xD7 ${still.output.height} from the original, approved in the thumbnail review \u2013 upload it with the video, not a timeline medium` });
        }
      }
    }
    for (const given of request.attachments ?? []) {
      const absolute = path24.resolve(root, given);
      const relPath = rel2(root, absolute);
      if (!relPath || relPath.startsWith("..") || path24.isAbsolute(relPath)) throw new CliError("invalid-input", `--attach ${given}: only files inside the project folder can be attached`);
      if (relPath.startsWith(`renders/${PREMIERE_DIR}/`) || relPath.startsWith(".darkmind/")) throw new CliError("invalid-input", `--attach ${given}: files of earlier packages or of .darkmind/ cannot be attached`);
      const stat = await fs26.stat(absolute).catch(() => null);
      if (!stat?.isFile()) throw new CliError("not-found", `--attach ${given}: no such file in the project folder`);
      if (stat.size > MAX_ATTACHMENT_BYTES) throw new CliError("invalid-input", `--attach ${given}: ${stat.size} bytes is too large for an attachment (max ${MAX_ATTACHMENT_BYTES}); media belong on the timeline`);
      if (deliverables.some((d) => d.from.file === relPath)) continue;
      const original = await hashFile(absolute);
      const name = rootName(path24.basename(relPath));
      const { sha256: sha2563, size } = await copyDeliverable(relPath, name);
      deliverables.push({ file: name, kind: "attachment", size, sha256: sha2563, from: { file: relPath, sha256: original.sha256 }, note: /chapter/i.test(name) ? "chapter list for the YouTube description (from the pipeline timeline; generate it again after timeline changes)" : "attached project file" });
    }
    let loudness = null;
    if (plan.audioMaster) {
      const final = await latestFinalReport(root);
      const result = final?.report.audioMaster ?? null;
      const checkStatus = final?.report.checks?.loudness?.status;
      const { integratedLufs, toleranceLu, truePeakDbtp } = plan.audioMaster;
      loudness = {
        target: { integratedLufs, toleranceLu, truePeakDbtp },
        ducking: plan.audioMaster.ducking ?? null,
        musicTracks,
        finalRender: final && result ? {
          report: final.file,
          input: { integratedLufs: result.input.integratedLufs, truePeakDbtp: result.input.truePeakDbtp },
          normalization: result.normalization,
          correctionDb: result.correctionDb,
          output: result.output,
          check: checkStatus === "pass" || checkStatus === "fail" ? checkStatus : null
        } : null,
        note: `The render masters the whole mix to ${integratedLufs} LUFS integrated (\xB1${toleranceLu} LU), true peak \u2264 ${truePeakDbtp} dBTP (house norm T5)${plan.audioMaster.ducking && musicTracks.length ? `, with music ${plan.audioMaster.ducking.underDialogDb} dB under dialog` : ""}. The package carries the clips with their levels, not the mastered mix: set the loudness in Premiere when exporting.`
      };
    }
    const reviewState = state;
    const approvals = (gate?.approvals ?? []).map((file) => {
      const record = reviewState?.records.find((r) => r.file === file);
      return { file, subject: record?.record.subject ?? "unknown", hash: record?.record.hash ?? "" };
    });
    const bindings = reviewState ? reviewBindings(reviewState) : reviewBindings(await computeReviewState(root, { validation: planned.validation }));
    const lastCaption = plan.captions.reduce((max, c) => Math.max(max, c.end), 0);
    const notes = [
      `The sequence starts at 00:00:00:00; ${delivery === "srt" ? `captions use timeline times (SRT rule T4: frame k \u2192 floor(k\xB71000/fps)+1 ms) and belong at 00:00:00:00.` : "there is no SRT file."}`,
      "Video in-points come from <in> (sequence frames), audio in-points from pproTicksIn; all cut points lie on the output frame grid (rule T2), so picture and sound match the ffmpeg render.",
      "Framing is a Motion effect (scale, position) per clip \u2013 not baked into the media (rule G1).",
      "Media paths in the XML are relative to the XML file: keep the folder structure (XML next to media/) when moving or copying the package."
    ];
    if (delivery === "srt" && lastCaption === plan.totalFrames) notes.push("A caption that ends exactly at the end of the sequence may be shortened by one frame on import (seen in Premiere Pro 2027 at 25 fps; within the 1-frame import tolerance).");
    if (media.some((m) => m.role === "conform")) notes.push(`Conform media (rule C1) cover the used ranges plus ${handleSeconds} s handles of their originals; for more material export again with --handles <seconds>.`);
    const channels = [...audioByFile.values()].map((m) => m.xmeml.audio?.channels ?? 2);
    if (media.some((m) => m.conform?.reasons.includes("mono"))) notes.push(`Mono sources are delivered with stereo sound (the mono channel on both sides, like the render; ${handleSeconds} s handles): Premiere plays a mono file on a stereo track on the left channel only.`);
    const boosted = media.filter((m) => m.conform?.gainDb);
    if (boosted.length) notes.push(`Premiere accepts clip volume levels up to +${PREMIERE_MAX_LEVEL_DB} dB. The sound of ${boosted.map((m) => `\`${m.file}\` (+${m.conform.gainDb} dB)`).join(", ")} is delivered as stereo PCM with the gain above +${PREMIERE_MAX_LEVEL_DB} dB applied; the clip levels show the rest, so the mix matches the render (${handleSeconds} s handles).`);
    if (channels.some((c) => c > 2)) notes.push("Sources with more than two audio channels: Premiere uses channels 1 and 2 (the render mixes all channels down to stereo).");
    if (media.some((m) => m.placed === "hardlink")) notes.push("Media files are hard links to the project files where possible (no extra disk space); copying the folder to another drive copies the data.");
    for (const issue of issues.filter((i) => i.severity === "warning")) notes.push(`Warning ${issue.code}${issue.ref ? ` (${issue.ref})` : ""}: ${issue.message}`);
    if (delivery === "overlay" && !captionTracks.length) notes.push("Warning: the captions use a brand style, but no caption overlay is on the timeline \u2013 the package has no captions (T8: brand captions reach Premiere only as the rendered overlay). Place the caption block on an overlay track and export again.");
    const overlayNames = captionOverlay?.extensions.map((id2) => `"[rendered] ${id2}"`).join(", ") ?? "";
    const importOrder = [
      "Keep this folder together; move or copy it as a whole (the XML finds media/ next to itself).",
      `File > Import\u2026 (Ctrl+I) and select \`${xmlName}\`. Premiere creates a bin with the sequence "${title}" and the media; all media are online (if not: right-click an offline item > Link Media\u2026 > Locate, select the file in media/ \u2013 the rest is found automatically).`,
      `Open the sequence "${title}" (double-click). Sequence > Sequence Settings shows ${W} \xD7 ${H}, ${rate} fps, ${plan.output.sampleRate / 1e3} kHz.`,
      ...srtName ? [
        `Captions: File > Import\u2026 and select \`${srtName}\`. Press Home in the timeline (playhead at 00:00:00:00), then drag the caption item from the Project panel into the timeline so that it starts exactly at 00:00:00:00 (it snaps to the playhead). Premiere creates a caption track with ${plan.captions.length} captions; the first one starts at ${frameTimecode(Math.min(...plan.captions.map((c) => c.start)), fps)}.`
      ] : delivery === "overlay" ? [
        captionTracks.length ? `Captions are the rendered overlay ${overlayNames} on video track ${captionTracks.join(", ")} \u2013 a track of its own (brand captions, exception T8). There is no caption track and no SRT to import. You can move, trim, disable or fade the overlay clip like any clip, but not edit its text: correct captions.json in the pipeline, render and export again.` : "The captions use a brand style but are not on the timeline (see Compatibility); there is no SRT to import."
      ] : [],
      ...loudness ? [`Loudness: the package does not contain the mastered mix \u2013 set ${loudness.target.integratedLufs} LUFS / ${loudness.target.truePeakDbtp} dBTP when exporting from Premiere (see "Loudness" below).`] : [],
      "Save the Premiere project (File > Save As\u2026) wherever you like \u2013 it is a separate working state; changes are not transferred back into the pipeline."
    ];
    const pendingFiles = media.filter((m) => m.state === "pending");
    if (proxyMode && pendingFiles.length) {
      const offlineCount = pendingFiles.length;
      importOrder.splice(
        1,
        1,
        `File > Import\u2026 (Ctrl+I) and select \`${xmlName}\`. ${offlineCount} hi-res file(s) are not in \`media/\` yet: Premiere first searches the disk ("Locating media\u2026") \u2013 cancel it; in **Link Media** click **Offline All**. The clips are offline (red) for now.`,
        `Project panel: select the offline items (${pendingFiles.map((m) => `\`${path24.basename(m.file)}\``).join(", ")}) \u2192 right-click \u2192 **Proxy > Attach Proxies\u2026** \u2192 choose the matching \`<name>_Proxy\` file in \`${PROXY_DIR}/\` (Premiere may match the others by itself).`,
        "Program Monitor: Button Editor (+) \u2192 drag **Toggle Proxies** into the button bar and switch it on (blue): the clips play from the proxies. Edit as usual \u2013 cuts, framing and levels refer to the hi-res media."
      );
      importOrder.splice(
        importOrder.length - 1,
        0,
        `Hi-res before the final export: close Premiere, let the agent run \`darkmind-agent export hires\` for this folder (it needs the originals: get_media_sources(kind original) \u2192 darkmind-agent media <ticket>), then open the Premiere project again \u2013 the clips are online; switch **Toggle Proxies** off. If a clip still shows its proxy: right-click \u2192 Proxy > Reconnect Full Resolution Media\u2026 (or Link Media\u2026) and point to \`media/\`. **Never export the final video before that:** while a hi-res file is missing, Premiere exports from the proxy without a warning.`
      );
      notes.push(`Proxy package: ${offlineCount} hi-res medium/media follow with darkmind-agent export hires; proxies in ${PROXY_DIR}/ (Premiere's naming <name>_Proxy, exact divisor of the hi-res size, same frame rate, length and audio channels \u2013 Premiere's rules for attaching proxies).`);
    }
    const placeholders = media.filter((m) => m.state === "placeholder" || m.state === "proxy-render");
    if (proxyMode && placeholders.length) notes.push(`Placeholders until export hires: ${placeholders.map((m) => `\`${m.file}\` (${m.state === "placeholder" ? "sound from the proxy" : "rendered from proxies"})`).join(", ")} \u2013 same names and format, replaced by the hi-res version (close Premiere first).`);
    const recipe = docs.project.recipe ? { id: docs.project.recipe.id, version: docs.project.recipe.version === null ? "draft" : String(docs.project.recipe.version) } : null;
    const partial = {
      kind: "darkmind-premiere-package",
      version: 1,
      ...proxyMode ? {
        mode: "proxy",
        hiresFill: { status: media.some((m) => m.state && m.state !== "final") ? "pending" : "complete", filledAt: null, files: [] }
      } : {},
      exporterVersion: PREMIERE_EXPORTER_VERSION,
      agentVersion: AGENT_VERSION,
      project: { title, recipe },
      sequence: {
        name: title,
        file: xmlName,
        width: W,
        height: H,
        fps: `${rate}/1`,
        frames: plan.totalFrames,
        durationSeconds: formatRationalReadable(framesToSeconds(plan.totalFrames, fps)),
        sampleRate: plan.output.sampleRate,
        startTimecode: "00:00:00:00"
      },
      captions: {
        delivery,
        file: srtName,
        count: plan.captions.length,
        language: docs.captions?.language ?? null,
        rule: "T4: SRT time of frame k = floor(k*1000/fps)+1 ms (timeline time)",
        note: delivery === "srt" ? "editable caption track after the separate SRT import (F7, F13); no captions are burnt into the package media" : delivery === "overlay" ? "brand captions are delivered only as the rendered overlay on a video track of its own (Phase 6 T8, exception from F7); correct the text in captions.json, render and export again" : "the project has no captions",
        overlay: captionOverlay
      },
      importOrder,
      media,
      clips: packageClips,
      extensions,
      deliverables: { files: deliverables, notes: deliverableNotes },
      loudness,
      reviews: {
        gate: gate ? { action: gate.action, status: gate.status, basis: gate.basis } : null,
        bindings,
        approvals,
        note: "The export needs the same approvals as the final render (editorial, caption text, preview, duration exception if needed). The final approval refers to the rendered final file, not to this package."
      },
      compatibility: { verifiedWith: VERIFIED_PREMIERE, notes },
      toolchain: toolchainDocument(toolchain, null, null, brandPack)
    };
    const report = importReport(partial);
    await fs26.writeFile(path24.join(staging, xmlName), xml, "utf8");
    if (srtName && srt !== null) await fs26.writeFile(path24.join(staging, srtName), srt, "utf8");
    await fs26.writeFile(path24.join(staging, PACKAGE_REPORT), report, "utf8");
    const files = [];
    for (const name of [xmlName, ...srtName ? [srtName] : [], PACKAGE_REPORT]) {
      const { sha256: sha2563, size } = await hashFile(path24.join(staging, name));
      files.push({ path: name, size, sha256: sha2563 });
    }
    for (const m of media) {
      if (m.state !== "pending") files.push({ path: m.file, size: m.size, sha256: m.sha256 });
      if (m.proxy) files.push({ path: m.proxy.file, size: m.proxy.size, sha256: m.proxy.sha256 });
    }
    for (const d of deliverables) files.push({ path: d.file, size: d.size, sha256: d.sha256 });
    files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
    const packageKey = sha256Hex(JSON.stringify({ exporter: PREMIERE_EXPORTER_VERSION, files, ...proxyMode ? { mode: "proxy", pending: pendingFiles.map((m) => m.file) } : {} }));
    const premiereDir = path24.join(rendersDir, PREMIERE_DIR);
    const version = await nextPackageVersion(premiereDir);
    if (version.previous) {
      const previousDir = path24.join(premiereDir, version.previous);
      const previous = await readJsonFile(path24.join(previousDir, PACKAGE_MANIFEST)).catch(() => null);
      if (previous?.packageKey === packageKey) {
        const check3 = await verifyPremierePackage(previousDir);
        if (check3.ok) {
          await pruneCache2(conformDir, keepConform, 14 * 864e5);
          return { status: "unchanged", dir: rel2(root, previousDir), manifest: previous, warnings: issues.filter((i) => i.severity === "warning") };
        }
      }
    }
    const manifest = { ...partial, createdAt: (request.now?.() ?? /* @__PURE__ */ new Date()).toISOString(), packageKey, files };
    await fs26.writeFile(path24.join(staging, PACKAGE_MANIFEST), `${JSON.stringify(manifest, null, 2)}
`, "utf8");
    const check2 = await verifyPremierePackage(staging);
    if (!check2.ok) throw new CliError("export-verification-failed", `The package is incomplete: ${check2.problems.join("; ")}`, { problems: check2.problems });
    const target = path24.join(premiereDir, `v${String(version.number).padStart(4, "0")}`);
    await fs26.mkdir(premiereDir, { recursive: true });
    await renameWithRetry(staging, target);
    await pruneCache2(conformDir, keepConform, 14 * 864e5);
    return { status: "exported", dir: rel2(root, target), manifest, warnings: issues.filter((i) => i.severity === "warning") };
  } catch (error) {
    if (error instanceof AbortedError) throw new CliError("aborted", "The export was cancelled; nothing was published (finished conform media stay cached).");
    throw error;
  } finally {
    await fs26.rm(workDir, { recursive: true, force: true }).catch(() => {
    });
    await release();
  }
}
var round3 = (value2, decimals) => Number(value2.toFixed(decimals));
function draftMarkers(docs, plan) {
  const markers = [];
  const items = new Map((docs.edit?.sequence ?? []).map((item) => [item.id, item]));
  const seen = /* @__PURE__ */ new Set();
  for (const track of plan.video) {
    if (track.role !== "main") continue;
    for (const clip of track.clips) {
      const id2 = clip.statementId ?? clip.sceneId;
      if (!id2 || seen.has(id2)) continue;
      seen.add(id2);
      const item = items.get(id2);
      if (!item) continue;
      const text3 = item.kind === "statement" ? item.quote ?? "" : item.text ?? item.description;
      const speaker = item.kind === "statement" && item.speaker?.name ? ` \u2013 ${item.speaker.name}` : "";
      markers.push({ frame: clip.start, name: `${id2}${speaker}`, comment: text3.length > 500 ? `${text3.slice(0, 497)}\u2026` : text3 });
    }
  }
  return markers;
}
var LOCKED_CODES = /* @__PURE__ */ new Set(["EBUSY", "EPERM", "EACCES"]);
async function fillPremiereHires(request) {
  const { root, tools } = request;
  const progress = request.progress ?? (() => {
  });
  const relDir = request.dir ?? await latestPackage(root);
  if (!relDir) throw new CliError("not-found", 'no Premiere package in renders/premiere/; run "darkmind-agent export premiere --proxy" first');
  const dir = path24.resolve(root, relDir);
  const manifest = await readJsonFile(path24.join(dir, PACKAGE_MANIFEST)).catch(() => null);
  if (!manifest || manifest.kind !== "darkmind-premiere-package") throw new CliError("not-found", `${relDir} is not a Premiere package (no ${PACKAGE_MANIFEST})`);
  if (manifest.mode !== "proxy") throw new CliError("not-a-proxy-package", `${relDir} was exported with the hi-res media already (not with --proxy); nothing to fill`);
  const open = manifest.media.filter((m) => m.state && m.state !== "final");
  if (!open.length) return { status: "complete", dir: rel2(root, dir) || dir, filled: [], manifest };
  const rendersDir = path24.join(root, "renders");
  const release = await acquireLock(path24.join(rendersDir, ".lock"));
  const workDir = path24.join(dir, ".hires-tmp");
  const filled = [];
  try {
    await fs26.rm(workDir, { recursive: true, force: true });
    await fs26.mkdir(workDir, { recursive: true });
    const detected = await detectToolchain(tools, request.env, { needFont: false });
    if (!detected.toolchain) throw new PreflightError("preflight-failed", detected.problems.map((p) => p.message).join("; "), { issues: detected.problems.map((p) => ({ severity: "error", ...p })) });
    const toolchain = detected.toolchain;
    const hashCache = await HashCache.load(mediaHashCachePath(root));
    const originals = /* @__PURE__ */ new Map();
    const needs = [];
    for (const m of open) {
      if (m.state === "proxy-render" || !m.videoId || originals.has(m.videoId)) continue;
      const abs2 = await findOriginal(root, m.videoId);
      if (!abs2) {
        if (!needs.some((n) => n.videoId === m.videoId)) needs.push({ videoId: m.videoId, sourceId: m.sourceId ?? "", kind: "original", ranges: null, hint: `get_media_sources(kind original, ${m.videoId}) \u2192 darkmind-agent media <ticket>` });
        continue;
      }
      const info = await probeStreams(tools, abs2, { signal: request.signal });
      const facts = m.hires?.facts;
      if (facts) {
        const differences = factsDifferences(facts, toMediaFacts(info, facts.video?.vfr ?? false, "original", ""));
        if ((facts.audio?.channels ?? 0) !== (info.audio?.channels ?? 0)) differences.push(`audio channels ${facts.audio?.channels ?? 0} \u2192 ${info.audio?.channels ?? 0}`);
        if (differences.length) throw new CliError("original-mismatch", `${rel2(root, abs2)} differs from the original this package was exported for (${differences.join("; ")}); export a new package`, { videoId: m.videoId, differences });
      }
      const stat = await fs26.stat(abs2);
      const sha2563 = await hashCache.hash(rel2(root, abs2), abs2, stat.size, Math.round(stat.mtimeMs));
      const recorded = open.find((e) => e.videoId === m.videoId && e.role === "original" && e.sha256)?.sha256;
      if (recorded && recorded !== sha2563) throw new CliError("original-mismatch", `${rel2(root, abs2)} does not match the SHA-256 recorded in sources.json when the package was exported; export a new package`, { videoId: m.videoId });
      originals.set(m.videoId, { abs: abs2, info, sha256: sha2563 });
    }
    await hashCache.save();
    if (needs.length) {
      throw new CliError("media-missing", `export hires needs the originals of ${needs.map((n) => n.videoId).join(", ")} in media/original/:
${needs.map((n) => `needs: ${n.hint}`).join("\n")}`, { needs });
    }
    const renders = open.filter((m) => m.state === "proxy-render" && m.extensionId);
    if (renders.length) {
      const summary3 = await runExtensions({ root, mode: "original", tools, env: request.env, only: [...new Set(renders.map((m) => m.extensionId))], signal: request.signal, progress });
      if (!summary3.ok) throw extensionsError(summary3);
    }
    const conformDir = path24.join(rendersDir, RENDER_DIRS.cache, "conform");
    const built = [];
    for (const m of open) {
      const temp = path24.join(workDir, path24.basename(m.file));
      if (m.state === "proxy-render") {
        const extension = manifest.extensions.find((e) => e.id === m.extensionId);
        if (!extension) throw new CliError("invalid-input", `${m.file}: extension ${m.extensionId} is not in the manifest`);
        const output = path24.join(root, ...extension.output.split("/"));
        const [before, after] = await Promise.all([probeStreams(tools, path24.join(dir, ...m.file.split("/"))), probeStreams(tools, output)]);
        const sameShape = (before.video?.width ?? 0) === (after.video?.width ?? 0) && (before.video?.height ?? 0) === (after.video?.height ?? 0) && Boolean(before.audio) === Boolean(after.audio) && Math.abs(toNumberQ(before.durationSeconds ?? rational(0)) - toNumberQ(after.durationSeconds ?? rational(0))) < 0.5 / Number(parseRational(manifest.sequence.fps).n);
        if (!sameShape) throw new CliError("extension-changed", `the output of extension ${m.extensionId} from the originals does not have the size/length of the one in the package; the project changed since the export \u2013 export a new package`);
        const placed2 = await placeFile(output, temp);
        const { sha256: sha2563, size } = await hashFile(temp);
        built.push({ entry: m, temp, placed: placed2, size, sha256: sha2563, from: { file: extension.output, sha256: sha2563 } });
        continue;
      }
      const original = originals.get(m.videoId);
      const originalRel = rel2(root, original.abs);
      if (m.role === "original") {
        progress(`hi-res ${m.file}`);
        const placed2 = await placeFile(original.abs, temp);
        built.push({ entry: m, temp, placed: placed2, size: (await fs26.stat(temp)).size, sha256: original.sha256, from: { file: originalRel, sha256: original.sha256 } });
        continue;
      }
      const spec = m.hires?.spec;
      if (!spec) throw new CliError("invalid-input", `${m.file}: the manifest has no conform recipe for it; export a new package`);
      const ext = spec.audioOnly ? "wav" : "mov";
      const key = sha256Hex(JSON.stringify({ version: CONFORM_VERSION, original: original.sha256, spec, ffmpeg: toolchain.ffmpeg }));
      const cached = path24.join(conformDir, `${key}.${ext}`);
      let entry = await cachedEntry(cached);
      if (!entry) {
        progress(`${spec.audioOnly ? "stereo audio" : "conform"} ${spec.sourceId} (${spec.reasons.join(", ")}, frames ${spec.fromFrame}-${spec.toFrame})`);
        const work = path24.join(workDir, `build-${path24.basename(m.file)}`);
        const result = await tools.run(tools.ffmpeg, conformArgs(spec, original.abs, original.info, work), { cwd: workDir, signal: request.signal, timeoutMs: 6 * 60 * 6e4 });
        if (result.code !== 0) throw new CliError("ffmpeg-failed", `conform of source "${spec.sourceId}" failed: ${result.stderr.trim().split(/\r?\n/).slice(-3).join(" | ")}`);
        const problems = await verifyConform(tools, work, spec, original.info.video ? { width: original.info.video.width, height: original.info.video.height } : null);
        if (problems.length) throw new CliError("conform-verification-failed", `conform of source "${spec.sourceId}" does not match the plan: ${problems.join("; ")}`, { problems });
        entry = await storeEntry(work, cached, spec.toFrame - spec.fromFrame);
      }
      const placed = await placeFile(cached, temp);
      built.push({ entry: m, temp, placed, size: entry.size, sha256: entry.sha256, from: { file: originalRel, sha256: original.sha256 } });
    }
    const now = (request.now?.() ?? /* @__PURE__ */ new Date()).toISOString();
    const save = async () => {
      const done = new Set(filled.map((f) => f.file));
      const files = manifest.files.filter((f) => !done.has(f.path));
      for (const b of built) if (done.has(b.entry.file)) files.push({ path: b.entry.file, size: b.size, sha256: b.sha256 });
      files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
      manifest.files = files;
      const complete = manifest.media.every((m) => !m.state || m.state === "final");
      manifest.hiresFill = { status: complete ? "complete" : "pending", filledAt: complete ? now : manifest.hiresFill?.filledAt ?? null, files: [.../* @__PURE__ */ new Set([...manifest.hiresFill?.files ?? [], ...done])].sort() };
      await fs26.writeFile(path24.join(dir, PACKAGE_REPORT), importReport(manifest), "utf8");
      const report = await hashFile(path24.join(dir, PACKAGE_REPORT));
      manifest.files = manifest.files.map((f) => f.path === PACKAGE_REPORT ? { path: f.path, size: report.size, sha256: report.sha256 } : f);
      await fs26.writeFile(path24.join(dir, PACKAGE_MANIFEST), `${JSON.stringify(manifest, null, 2)}
`, "utf8");
    };
    try {
      for (const b of built) {
        const target = path24.join(dir, ...b.entry.file.split("/"));
        if (!await fs26.stat(target).catch(() => null)) continue;
        const probe2 = `${target}.hires-check`;
        try {
          await fs26.rename(target, probe2);
        } catch (error) {
          if (LOCKED_CODES.has(error.code ?? "")) {
            throw new CliError("premiere-open", `${b.entry.file} is in use \u2013 close Premiere Pro (it keeps the package media open) and run "darkmind-agent export hires" again; nothing was changed`, { file: b.entry.file, filled: [] });
          }
          throw error;
        }
        await renameWithRetry(probe2, target);
      }
      for (const b of built) {
        const target = path24.join(dir, ...b.entry.file.split("/"));
        try {
          await renameWithRetry(b.temp, target);
        } catch (error) {
          if (LOCKED_CODES.has(error.code ?? "")) {
            throw new CliError("premiere-open", `${b.entry.file} is in use \u2013 close Premiere Pro (it keeps the package media open) and run "darkmind-agent export hires" again; files moved so far are recorded`, { file: b.entry.file, filled: filled.map((f) => f.file) });
          }
          throw error;
        }
        b.entry.state = "final";
        b.entry.size = b.size;
        b.entry.sha256 = b.sha256;
        b.entry.placed = b.placed;
        b.entry.from = b.from;
        filled.push({ file: b.entry.file, role: b.entry.role, from: b.from.file, placed: b.placed });
      }
    } finally {
      if (filled.length) await save();
    }
    const check2 = await verifyPremierePackage(dir);
    if (!check2.ok) throw new CliError("export-verification-failed", `The package is incomplete after export hires: ${check2.problems.join("; ")}`, { problems: check2.problems });
    return { status: "filled", dir: rel2(root, dir) || dir, filled, manifest };
  } catch (error) {
    if (error instanceof AbortedError) throw new CliError("aborted", "export hires was cancelled; files already moved into media/ are recorded in the manifest");
    throw error;
  } finally {
    await fs26.rm(workDir, { recursive: true, force: true }).catch(() => {
    });
    await release();
  }
}
async function latestPackage(root) {
  const dir = path24.join(root, "renders", PREMIERE_DIR);
  const { previous } = await nextPackageVersion(dir);
  return previous ? `renders/${PREMIERE_DIR}/${previous}` : null;
}

// src/commands/export.ts
async function exportCommand(ctx, target, args, options, tools = defaultTools(ctx.env)) {
  if (target === "verify") return verifyCommand(ctx, args[0]);
  if (target === "hires") return hiresCommand(ctx, args[0], options.signal, tools);
  if (target !== "premiere") throw new CliError("usage", `export needs a target: "export premiere [--proxy]", "export hires [<folder>]" or "export verify [<folder>]"${target ? `, not "${target}"` : ""}`);
  if (args.length) throw new CliError("usage", `export premiere takes no arguments, not "${args.join(" ")}"`);
  let handleSeconds;
  if (options.handles !== void 0) {
    handleSeconds = Number(options.handles);
    if (!/^\d+(\.\d+)?$/.test(options.handles) || !(handleSeconds <= 600)) throw new CliError("usage", "--handles must be a number of seconds between 0 and 600");
  }
  let outcome;
  try {
    outcome = await exportPremierePackage({ root: ctx.root, tools, env: ctx.env, handleSeconds, attachments: options.attach, proxy: options.proxy, signal: options.signal, progress: ctx.progress });
  } catch (error) {
    if (error instanceof CliError && error.code === "preflight-failed") {
      const details = error.details;
      throw new CliError(error.code, [error.message, ...(details?.needs ?? []).map((n) => `needs: ${n.hint}`)].join("\n"), error.details);
    }
    throw error;
  }
  const { manifest } = outcome;
  const bytes = manifest.files.reduce((sum, file) => sum + file.size, 0);
  const rendered = manifest.extensions.map((e) => e.id);
  const conforms = manifest.media.filter((m) => m.conform);
  const report = `${outcome.dir}/${PACKAGE_REPORT}`;
  const pending = manifest.media.filter((m) => m.state && m.state !== "final");
  return {
    data: {
      status: outcome.status,
      dir: outcome.dir,
      xml: `${outcome.dir}/${manifest.sequence.file}`,
      srt: manifest.captions.file ? `${outcome.dir}/${manifest.captions.file}` : null,
      report,
      manifest: `${outcome.dir}/manifest.json`,
      sequence: manifest.sequence,
      captions: manifest.captions,
      ...manifest.mode ? { mode: manifest.mode, hiresFill: manifest.hiresFill } : {},
      media: manifest.media.map(({ file, role, editable, sourceId, extensionId, size, placed, conform, state, proxy }) => ({ file, role, editable, sourceId, extensionId, size, placed, ...conform ? { conform } : {}, ...state ? { state } : {}, ...proxy ? { proxy: proxy.file } : {} })),
      extensions: manifest.extensions,
      deliverables: manifest.deliverables,
      loudness: manifest.loudness,
      reviews: manifest.reviews,
      importOrder: manifest.importOrder,
      compatibility: manifest.compatibility,
      warnings: outcome.warnings,
      next: pending.length ? `Give the editor the folder ${outcome.dir} and its ${PACKAGE_REPORT}: import, Offline All, Attach Proxies (${pending.filter((m) => m.proxy).length} proxies in proxies/). Before the final export from Premiere: get_media_sources(kind original) \u2192 darkmind-agent media <ticket>, the editor closes Premiere, darkmind-agent export hires ${outcome.dir}, the editor reopens the project. Premiere changes stay in Premiere (no re-import).` : `Give the editor the folder ${outcome.dir} and its ${PACKAGE_REPORT} (import steps). Premiere changes stay in Premiere (no re-import).`
    },
    text: [
      `${outcome.status === "unchanged" ? "unchanged" : "exported"} ${outcome.dir} \u2013 ${manifest.sequence.file}${manifest.captions.file ? ` + ${manifest.captions.file}` : ""}, ${manifest.media.length} media files (${formatBytes(bytes)}), ${manifest.sequence.frames} frames (${manifest.sequence.durationSeconds} s)`,
      ...conforms.map((m) => `conform (C1, ${m.conform.reasons.join("+")}): ${m.file} = ${m.sourceId} ${m.conform.fromSeconds}\u2013${m.conform.toSeconds} s`),
      rendered.length ? `rendered media (not natively editable): ${rendered.join(", ")}` : "",
      ...pending.map((m) => `${m.state === "pending" ? "hi-res later" : m.state === "placeholder" ? "placeholder sound" : "rendered from proxies"}: ${m.file}${m.proxy ? ` \u2013 proxy ${m.proxy.file} (1/${m.proxy.divisor})` : ""}`),
      pending.length ? `proxy package: the editor attaches the proxies in Premiere; before the final export run "darkmind-agent export hires ${outcome.dir}" with Premiere closed` : "",
      `captions: ${manifest.captions.delivery === "srt" ? `${manifest.captions.count} as SRT (import separately at 00:00:00:00)` : manifest.captions.delivery === "overlay" ? manifest.captions.overlay?.tracks.length ? `rendered overlay only, own track ${manifest.captions.overlay.tracks.join(", ")} (T8)` : "brand style but no overlay on the timeline \u2013 no captions in the package" : "none"}`,
      ...(manifest.deliverables?.files ?? []).map((d) => `next to IMPORT.md: ${d.file} (${d.kind})`),
      ...(manifest.deliverables?.notes ?? []).map((n) => `note: ${n}`),
      manifest.loudness ? `loudness: package without the mastered mix \u2013 target ${manifest.loudness.target.integratedLufs} LUFS / ${manifest.loudness.target.truePeakDbtp} dBTP set in Premiere's export (IMPORT.md)` : "",
      ...outcome.warnings.map((w) => `warning ${w.code}${w.ref ? ` (${w.ref})` : ""}: ${w.message}`),
      `import steps: ${report}`
    ].filter(Boolean).join("\n")
  };
}
async function hiresCommand(ctx, folder, signal, tools) {
  const outcome = await fillPremiereHires({ root: ctx.root, tools, env: ctx.env, dir: folder, signal, progress: ctx.progress });
  const next = outcome.status === "complete" ? `${outcome.dir} already holds every hi-res medium.` : `Tell the editor: open the Premiere project again (the clips are online), switch Toggle Proxies off \u2013 if a clip still shows its proxy: right-click > Proxy > Reconnect Full Resolution Media\u2026 and point to media/. Only now export the final video from Premiere.`;
  return {
    data: { status: outcome.status, dir: outcome.dir, filled: outcome.filled, hiresFill: outcome.manifest.hiresFill ?? null, next },
    text: [
      outcome.status === "complete" ? `${outcome.dir}: complete, nothing to fill` : `${outcome.dir}: ${outcome.filled.length} hi-res file(s) in place`,
      ...outcome.filled.map((f) => `  ${f.file} \u2190 ${f.from} (${f.placed})`),
      next
    ].join("\n")
  };
}
async function verifyCommand(ctx, folder) {
  const relDir = folder ?? await latestPackage(ctx.root);
  if (!relDir) throw new CliError("not-found", 'no Premiere package in renders/premiere/; run "darkmind-agent export premiere" first');
  const dir = path25.resolve(ctx.root, relDir);
  const check2 = await verifyPremierePackage(dir);
  return {
    data: { dir, ok: check2.ok, checkedFiles: check2.checkedFiles, problems: check2.problems, pending: check2.pending, sequence: check2.manifest?.sequence ?? null },
    text: check2.ok ? `${dir}: ${check2.pending.length ? `consistent proxy package, ${check2.pending.length} hi-res file(s) pending (darkmind-agent export hires)` : "complete"} (${check2.checkedFiles} files match the manifest; media paths relative to the XML)` : [`${dir}: ${check2.problems.length} problem(s)`, ...check2.problems.map((p) => `  - ${p}`)].join("\n"),
    exitCode: check2.ok ? 0 : 1
  };
}

// src/commands/extensions.ts
import path28 from "node:path";

// src/commands/render.ts
import { promises as fs28 } from "node:fs";
import path27 from "node:path";

// src/commands/media.ts
import { promises as fs27 } from "node:fs";
import path26 from "node:path";
var LARGE_ORIGINALS_BYTES = 10 * 1024 ** 3;
var CACHE_MIN_VALIDITY_MS = 10 * 60 * 1e3;
function parseTime(text3) {
  const parts = text3.trim().split(":");
  if (parts.length > 3 || parts.some((part) => !/^\d+(\.\d+)?$/.test(part))) throw new CliError("invalid-input", `"${text3}" is not a time (seconds or [h:]mm:ss)`);
  return parts.reduce((total, part) => total * 60 + Number(part), 0);
}
function parseRange2(text3) {
  const colon = text3.indexOf(":");
  const videoId = text3.slice(0, colon).trim();
  const times = text3.slice(colon + 1).split("-");
  if (colon < 0 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(videoId) || times.length !== 2) {
    throw new CliError("invalid-input", `--range "${text3}" must look like <videoId>:<from>-<to>, e.g. 3F2A\u2026:12.5-20 or 3F2A\u2026:1:05-1:20`);
  }
  const from = parseTime(times[0]);
  const to = parseTime(times[1]);
  if (!(to > from)) throw new CliError("invalid-input", `--range "${text3}": end must be after start`);
  return { videoId: normalizeCutProjectVideoId(videoId), from, to };
}
function formatSeconds2(seconds2) {
  return String(Math.round(seconds2 * 1e3) / 1e3);
}
function seekArgument(value2) {
  const micro = value2.n * 1000000n / value2.d;
  return `${micro / 1000000n}.${String(micro % 1000000n).padStart(6, "0")}`.replace(/\.?0+$/, "") || "0";
}
async function snapExcerptStart(tools, input, from) {
  const before = Math.max(0, Math.floor(from) - 5);
  const pts = await probeFramePts(tools, input, { readIntervals: `${before}%${Math.ceil(from) + 2}` });
  if (pts.length === 0) throw new CliError("proxy-offset-unknown", "The proxy frame times around the excerpt start could not be read (rule E1).");
  const target = parseRational(formatSeconds2(from));
  let chosen = null;
  for (const value2 of pts) if (compareQ(value2, target) <= 0) chosen = value2;
  return chosen ?? pts[0];
}
async function loadTransfer(ctx, ticket, server) {
  const directory = statePaths(ctx.root).mediaTickets;
  const file = path26.join(directory, `${sha256Hex(ticket).slice(0, 32)}.json`);
  const now = Date.now();
  for (const name of await fs27.readdir(directory).catch(() => [])) {
    const entry = await readJsonFile(path26.join(directory, name)).catch(() => null);
    if (!entry || Date.parse(entry.expiresAt) < now) await fs27.rm(path26.join(directory, name), { force: true });
  }
  const cached = await readJsonFile(file).catch(() => null);
  if (cached?.kind === "media" && Date.parse(cached.expiresAt) - now > CACHE_MIN_VALIDITY_MS) return { transfer: cached, cached: true };
  const transfer = expectKind(await redeemTicket(server(), ticket), "media", "media");
  await writeJsonFile(file, transfer);
  return { transfer, cached: false };
}
function relativeTo(root, file) {
  return path26.relative(root, file).split(path26.sep).join("/");
}
function proxyIdentity(item) {
  const files = item.files;
  if (!files) return null;
  const part = (file) => file ? { size: file.size ?? null, etag: file.etag ?? null } : null;
  const video = part(files.video);
  if (video.size === null && video.etag === null) return null;
  return { video, audio: part(files.audio) };
}
function originalIdentity(item) {
  return { size: item.size, etag: item.etag ?? null };
}
async function cutProxy(tools, item, range2, out, warnings, local) {
  const input = local ?? item.files?.video.url ?? (range2 ? item.playlistUrl : null);
  let start = null;
  if (range2 && input) start = await snapExcerptStart(tools, input, range2.from);
  const seek = range2 && start ? ["-ss", seekArgument(start), "-t", formatSeconds2(range2.to - toNumberQ(start))] : [];
  const temp = `${out}.part.mp4`;
  const args = ["-hide_banner", "-nostdin", "-loglevel", "error", "-y"];
  if (local) {
    args.push(...seek, "-i", local, "-map", "0:v:0", "-map", "0:a?");
  } else if (item.files) {
    args.push(...seek, "-i", item.files.video.url);
    if (item.files.audio) args.push(...seek, "-i", item.files.audio.url, "-map", "0:v:0", "-map", "1:a:0");
    else args.push("-map", "0:v:0", "-map", "0:a?");
  } else if (range2 && item.playlistUrl) {
    warnings.push(`${item.videoId}: proxy files unavailable (${item.filesError ?? "unknown reason"}), excerpt read via the HLS playlist.`);
    args.push(...seek, "-i", item.playlistUrl, "-map", "0:v:0", "-map", "0:a?");
  } else {
    throw new CliError(
      "proxy-files-unavailable",
      `Proxy files unavailable (${item.filesError ?? "unknown reason"}); load excerpts with --range ${item.videoId}:<from>-<to> or use the original.`
    );
  }
  args.push("-c", "copy", "-movflags", "+faststart", temp);
  await fs27.mkdir(path26.dirname(out), { recursive: true });
  const timeoutMs = range2 || local ? 30 * 6e4 : 4 * 60 * 6e4;
  let result = await tools.run(tools.ffmpeg, args, { timeoutMs });
  if (result.code !== 0) result = await tools.run(tools.ffmpeg, args, { timeoutMs });
  if (result.code !== 0) {
    await fs27.rm(temp, { force: true });
    const reason = result.stderr.trim().split(/\r?\n/).filter(Boolean).pop() ?? `exit code ${result.code}`;
    throw new CliError("ffmpeg-failed", `ffmpeg failed: ${reason.replace(/https?:\/\/\S+/g, "<url>")}`);
  }
  const info = await probe(tools, temp).catch((error) => {
    throw new CliError("invalid-media", `The proxy file is not readable: ${errorMessage(error)}`);
  });
  if (!info.hasVideo) throw new CliError("invalid-media", "The proxy file has no video stream.");
  let offset = rational(0);
  if (start) {
    const shown = (await probeFramePts(tools, temp, { readIntervals: "%+3" })).filter((value2) => value2.n >= 0n);
    offset = shown.length ? subQ(start, shown[0]) : start;
  }
  await renameWithRetry(temp, out);
  return { offset, info };
}
async function proxyFile(ctx, tools, item, range2, outDir, force, warnings, indexEntries, cache) {
  const name = range2 ? `${item.videoId}_${formatSeconds2(range2.from)}-${formatSeconds2(range2.to)}.mp4` : `${item.videoId}.mp4`;
  const out = path26.join(outDir, name);
  const rangeInfo = range2 ? { range: { from: range2.from, to: range2.to } } : {};
  if (!force && await fs27.stat(out).catch(() => null)) {
    const indexed = (await readProxyIndex(outDir)).files.find((entry) => entry.file.toLowerCase() === name.toLowerCase());
    const info2 = await probe(tools, out).catch(() => null);
    if (info2?.hasVideo && (indexed || !range2)) {
      const { size: size2 } = await fs27.stat(out);
      return { videoId: item.videoId, path: relativeTo(ctx.root, out), status: "exists", bytes: size2, ...rangeInfo, durationSeconds: info2.durationSeconds, offset: indexed?.offset ?? "0" };
    }
  }
  const identity = proxyIdentity(item);
  const key = cache && identity ? cacheKey(identity) : null;
  let status2 = "downloaded";
  let placed;
  let offset = rational(0);
  let info;
  let fromCachedProxy = false;
  if (!range2 && cache && identity && key) {
    const got = await cache.obtain("proxy", item.videoId, key, ".mp4", { identity, fileName: item.fileName }, async (target) => {
      await cutProxy(tools, item, null, target, warnings, null);
    }, { force, progress: ctx.progress });
    if (!got.stored) await cache.update(got.entry);
    status2 = got.stored ? "downloaded" : "cached";
    placed = await placeFromCache(got.file, out);
    info = await probe(tools, out).catch((error) => {
      throw new CliError("invalid-media", `The proxy file is not readable: ${errorMessage(error)}`);
    });
  } else {
    let local = null;
    if (range2 && cache && key && !force) {
      const hit = await cache.lookup("proxy", item.videoId, key);
      if (hit) {
        local = hit.file;
        await cache.update(hit.entry);
      }
    }
    ({ offset, info } = await cutProxy(tools, item, range2, out, warnings, local));
    if (local) {
      status2 = "cached";
      fromCachedProxy = true;
    }
  }
  const expected = range2 ? range2.to - toNumberQ(offset) : item.durationSeconds;
  if (expected && info.durationSeconds !== null && Math.abs(info.durationSeconds - expected) > 1) {
    warnings.push(`${name}: duration ${info.durationSeconds.toFixed(2)} s, expected ${expected.toFixed(2)} s.`);
  }
  const { size } = await fs27.stat(out);
  indexEntries.push({
    file: name,
    videoId: item.videoId,
    kind: range2 ? "excerpt" : "full",
    offset: formatRationalReadable(offset, 9),
    ...range2 ? { requested: { from: range2.from, to: range2.to } } : {},
    durationSeconds: info.durationSeconds === null ? null : String(info.durationSeconds),
    fileName: item.fileName ?? null,
    originalFileName: item.originalFileName ?? null
  });
  return {
    videoId: item.videoId,
    path: relativeTo(ctx.root, out),
    status: status2,
    bytes: size,
    ...rangeInfo,
    offset: formatRationalReadable(offset, 9),
    durationSeconds: info.durationSeconds,
    width: info.width,
    height: info.height,
    hasAudio: info.hasAudio,
    ...placed ? { placed } : {},
    ...fromCachedProxy ? { fromCachedProxy } : {}
  };
}
function originalExtension(item) {
  const ext = path26.extname(item.originalFileName || item.fileName || "").toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : ".mp4";
}
async function seedMediaHash(root, out, entry, cacheFile) {
  if (!entry.sha256 || entry.hashedMtimeMs === void 0) return;
  const source = await fs27.stat(cacheFile).catch(() => null);
  const placed = await fs27.stat(out).catch(() => null);
  if (!source || !placed || source.size !== entry.size || placed.size !== entry.size || Math.round(source.mtimeMs) !== entry.hashedMtimeMs) return;
  const cache = await HashCache.load(mediaHashCachePath(root));
  const mtimeMs = Math.round(placed.mtimeMs);
  cache.record(relativeTo(root, out), placed.size, mtimeMs, entry.sha256, Math.max(Date.now(), mtimeMs + 2001));
  await cache.save();
}
async function originalFile(ctx, tools, item, outDir, force, hasProbe, warnings, cache, streams) {
  const ext = originalExtension(item);
  const out = path26.join(outDir, `${item.videoId}${ext}`);
  const existing = await fs27.stat(out).catch(() => null);
  const identity = originalIdentity(item);
  const key = cacheKey(identity);
  if (!force && existing?.size === item.size) {
    if (cache) await cache.adopt("original", item.videoId, key, ext, { identity, fileName: item.fileName }, out).catch(() => false);
    return { videoId: item.videoId, path: relativeTo(ctx.root, out), status: "exists", bytes: item.size };
  }
  let status2 = "downloaded";
  let resumedBytes = 0;
  let placed;
  if (cache) {
    const got = await cache.obtain("original", item.videoId, key, ext, { identity, fileName: item.fileName }, async (target) => {
      resumedBytes = (await downloadFile(item.url, target, { size: item.size, label: item.fileName }, { streams })).resumedBytes;
    }, { force, progress: ctx.progress });
    let entry = got.entry;
    if (got.stored) {
      ctx.progress(`original ${item.videoId}: SHA-256 for the media cache`);
      const stat = await fs27.stat(got.file);
      const { sha256: sha2563 } = await hashFile(got.file);
      entry = await cache.update(entry, { sha256: sha2563, hashedMtimeMs: Math.round(stat.mtimeMs) });
    } else {
      entry = await cache.update(entry);
      status2 = "cached";
    }
    placed = await placeFromCache(got.file, out);
    if (placed === "copy") {
      warnings.push(
        `${item.videoId}: copied from the media cache (${formatBytes(item.size)}), because ${cache.dir} is on another drive than the project and symbolic links are not allowed. Set DARKMIND_MEDIA_CACHE to a folder on the project's drive (or enable the Windows developer mode) to link instead of copying.`
      );
    }
    await seedMediaHash(ctx.root, out, entry, got.file).catch(() => void 0);
  } else {
    await fs27.mkdir(outDir, { recursive: true });
    resumedBytes = (await downloadFile(item.url, out, { size: item.size, label: item.fileName }, { streams })).resumedBytes;
  }
  let info = null;
  if (hasProbe) {
    info = await probe(tools, out).catch((error) => {
      warnings.push(`${item.videoId}: ffprobe cannot read the original (${errorMessage(error)}).`);
      return null;
    });
  }
  return {
    videoId: item.videoId,
    path: relativeTo(ctx.root, out),
    status: status2,
    bytes: item.size,
    ...resumedBytes > 0 ? { resumedBytes } : {},
    ...placed ? { placed } : {},
    ...info ? { durationSeconds: info.durationSeconds, width: info.width, height: info.height, hasAudio: info.hasAudio } : {}
  };
}
async function mediaCommand(ctx, ticketArg, options = {}, tools = defaultTools(ctx.env)) {
  if (!ticketArg) throw new CliError("invalid-input", "Usage: darkmind-agent media <ticket> [--out <dir>] [--range <videoId>:<from>-<to>]\u2026");
  const ticket = checkTicket(ticketArg);
  const ranges = (options.ranges ?? []).map(parseRange2);
  const config = await readConfig(ctx.root);
  const [ffmpegVersion, ffprobeVersion] = await Promise.all([toolVersion(tools, "ffmpeg"), toolVersion(tools, "ffprobe")]);
  if (ranges.length > 0 && (!ffmpegVersion || !ffprobeVersion)) {
    throw new CliError("ffmpeg-missing", "ffmpeg and ffprobe are required for proxies; install ffmpeg (in PATH) or set DARKMIND_FFMPEG/DARKMIND_FFPROBE.");
  }
  const { transfer, cached } = await loadTransfer(ctx, ticket, () => resolveServer(ctx.server, config, ctx.env));
  const warnings = [];
  const files = [];
  const failed = [];
  const force = Boolean(options.force);
  const outDir = path26.resolve(ctx.root, options.out ?? (transfer.mediaKind === "proxy" ? "media/proxy" : "media/original"));
  const ticketErrors = new Map(transfer.errors.map((error) => [normalizeCutProjectVideoId(error.videoId), error]));
  let done = 0;
  const cache = options.noCache ? null : openMediaCache(ctx.env);
  const streams = Number(ctx.env.DARKMIND_AGENT_DOWNLOAD_STREAMS) > 0 ? Math.floor(Number(ctx.env.DARKMIND_AGENT_DOWNLOAD_STREAMS)) : void 0;
  if (transfer.mediaKind === "proxy") {
    if (!ffmpegVersion || !ffprobeVersion) {
      throw new CliError("ffmpeg-missing", "ffmpeg and ffprobe are required for proxies; install ffmpeg (in PATH) or set DARKMIND_FFMPEG/DARKMIND_FFPROBE.");
    }
    const byId = new Map(transfer.videos.map((item) => [normalizeCutProjectVideoId(item.videoId), item]));
    const jobs = [];
    if (ranges.length > 0) {
      for (const range2 of ranges) {
        const item = byId.get(range2.videoId);
        if (item) jobs.push({ item, range: range2 });
        else {
          const error = ticketErrors.get(range2.videoId);
          failed.push({ videoId: range2.videoId, range: { from: range2.from, to: range2.to }, code: error?.code ?? "not-in-ticket", message: error?.message ?? "The ticket does not contain this video." });
        }
      }
    } else {
      for (const item of transfer.videos) jobs.push({ item, range: null });
    }
    const indexEntries = [];
    await runPool(jobs, options.concurrency ?? 3, async ({ item, range: range2 }) => {
      try {
        files.push(await proxyFile(ctx, tools, item, range2, outDir, force, warnings, indexEntries, cache));
        ctx.progress(`proxy ${++done}/${jobs.length} ${item.videoId}`);
      } catch (error) {
        failed.push({
          videoId: item.videoId,
          ...range2 ? { range: { from: range2.from, to: range2.to } } : {},
          code: error instanceof CliError ? error.code : "failed",
          message: errorMessage(error)
        });
      }
    });
    if (indexEntries.length > 0) await updateProxyIndex(outDir, indexEntries);
  } else {
    if (ranges.length > 0) throw new CliError("invalid-input", "--range only works for proxies; originals are always downloaded completely (decision S6).");
    const total = transfer.videos.reduce((sum, item) => sum + item.size, 0);
    if (total > LARGE_ORIGINALS_BYTES) warnings.push(`Originals total ${formatBytes(total)} (internet egress, see the cost note in doc/CUT_PROJECTS.md); load only what the final render needs.`);
    if (!ffprobeVersion) warnings.push("ffprobe not found: originals are checked by size only.");
    await runPool(transfer.videos, options.concurrency ?? 2, async (item) => {
      try {
        files.push(await originalFile(ctx, tools, item, outDir, force, Boolean(ffprobeVersion), warnings, cache, streams));
        ctx.progress(`original ${++done}/${transfer.videos.length} ${item.videoId} (${formatBytes(item.size)})`);
      } catch (error) {
        failed.push({ videoId: item.videoId, code: error instanceof CliError ? error.code : "failed", message: errorMessage(error) });
      }
    });
  }
  let videoRefsAdded = [];
  if (config && !options.noRefs) {
    const known = new Set(config.videoRefs);
    videoRefsAdded = [...new Set(files.map((file) => normalizeCutProjectVideoId(file.videoId)))].filter((id2) => !known.has(id2));
    if (videoRefsAdded.length > 0) await writeConfig(ctx.root, { ...config, videoRefs: [...config.videoRefs, ...videoRefsAdded] });
  }
  files.sort((a, b) => a.path < b.path ? -1 : 1);
  const bytes = files.reduce((sum, file) => sum + (file.status === "downloaded" ? file.bytes : 0), 0);
  return {
    data: {
      mediaKind: transfer.mediaKind,
      projectId: transfer.projectId,
      outDir: relativeTo(ctx.root, outDir) || ".",
      files,
      failed,
      errors: transfer.errors,
      warnings,
      videoRefsAdded,
      ...cached ? { reusedRedemption: true } : {},
      mediaCache: cache ? cache.dir : null,
      expiresAt: transfer.expiresAt
    },
    text: [
      `${transfer.mediaKind}: ${files.length} file(s) in ${relativeTo(ctx.root, outDir) || "."} (${formatBytes(bytes)} downloaded), ${failed.length} failed.${cache ? ` Media cache: ${cache.dir}` : ""}`,
      ...files.map((file) => `  ${file.status.padEnd(10)} ${file.path}${file.placed && file.placed !== "hardlink" ? ` (${file.placed} of the media cache)` : ""}`),
      ...failed.map((failure) => `  failed     ${failure.videoId}${failure.range ? ` ${failure.range.from}-${failure.range.to}` : ""}: [${failure.code}] ${failure.message}`),
      ...transfer.errors.map((error) => `  unavailable ${error.videoId}: [${error.code}] ${error.message}`),
      ...warnings.map((warning) => `warning: ${warning}`)
    ].join("\n"),
    exitCode: failed.length > 0 ? 1 : 0
  };
}

// src/commands/render.ts
async function readRawJson(file, label2) {
  let text3;
  try {
    text3 = await fs28.readFile(file, "utf8");
  } catch {
    throw new CliError("not-found", `${label2} does not exist`);
  }
  try {
    const value2 = JSON.parse(text3.replace(/^\uFEFF/, ""));
    if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) throw new Error("not an object");
    return value2;
  } catch (error) {
    throw new CliError("invalid-json", `${label2} is not valid JSON: ${errorMessage(error)}`);
  }
}
async function probeCommand(ctx, options, tools = defaultTools(ctx.env)) {
  const project = await readRawJson(path27.join(ctx.root, EDIT_DEFAULT_FILES.project), EDIT_DEFAULT_FILES.project);
  const sourcesRel = project.artifacts?.sources ?? EDIT_DEFAULT_FILES.sources;
  const sourcesAbs = path27.join(ctx.root, ...sourcesRel.split("/"));
  const doc = await readRawJson(sourcesAbs, sourcesRel);
  if (doc.schemaVersion !== 1 || !Array.isArray(doc.sources)) throw new CliError("invalid-input", `${sourcesRel} is not a sources file of format v1 (run "darkmind-agent validate")`);
  const entries = doc.sources;
  const wanted = options.sources?.length ? new Set(options.sources) : null;
  if (wanted) {
    const unknown = [...wanted].filter((id2) => !entries.some((entry) => entry.id === id2));
    if (unknown.length) throw new CliError("invalid-input", `unknown source(s) ${unknown.join(", ")} in ${sourcesRel}`);
  }
  let originals = /* @__PURE__ */ new Map();
  if (options.ticket) {
    const config = await readConfig(ctx.root);
    const { transfer } = await loadTransfer(ctx, checkTicket(options.ticket), () => resolveServer(ctx.server, config, ctx.env));
    const media = expectKind(transfer, "media", "probe");
    if (media.mediaKind !== "original") {
      throw new CliError("wrong-ticket-kind", "probe needs a ticket for originals (get_media_sources kind original); facts of proxies are never recorded as facts of the original");
    }
    originals = new Map(media.videos.map((item) => [normalizeCutProjectVideoId(item.videoId), item]));
  }
  const now = (options.now?.() ?? /* @__PURE__ */ new Date()).toISOString();
  const cache = await HashCache.load(mediaHashCachePath(ctx.root));
  const outcomes = [];
  let changed = false;
  for (const entry of entries) {
    const sourceId = String(entry.id);
    if (wanted && !wanted.has(sourceId)) continue;
    const record = (facts, from, vfrBasis, identity) => {
      const existing = entry.media;
      if (existing && !options.force) {
        const differences = factsDifferences(existing, facts);
        if (differences.length) return { sourceId, status: "failed", from, code: "media-facts-changed", message: `the media differs from the recorded facts (${differences.join("; ")}); a changed source needs a new source revision (use --force only if that is intended)` };
      }
      if (identity) {
        const original = entry.original ?? {};
        if (!options.force && (original.size !== void 0 && identity.size !== void 0 && original.size !== identity.size || original.sha256 && identity.sha256 && original.sha256 !== identity.sha256)) {
          return { sourceId, status: "failed", from, code: "original-changed", message: "size or SHA-256 differ from the recorded original; a changed original needs a new source revision (use --force only if that is intended)" };
        }
        const next = { ...options.force ? {} : original, ...identity.size !== void 0 ? { size: identity.size } : {}, ...identity.sha256 ? { sha256: identity.sha256 } : {} };
        if (JSON.stringify(next) !== JSON.stringify(entry.original ?? null)) {
          entry.original = next;
          changed = true;
        }
      }
      if (existing && !options.force && factsDifferences(existing, facts).length === 0 && existing.probedFrom === facts.probedFrom) return { sourceId, status: "unchanged", from, vfrBasis };
      entry.media = facts;
      changed = true;
      return { sourceId, status: "recorded", from, vfrBasis };
    };
    try {
      if (entry.kind === "asset") {
        const rel3 = String(entry.path);
        const abs2 = path27.join(ctx.root, ...rel3.split("/"));
        const info = await probeStreams(tools, abs2);
        if (!info.durationSeconds || !info.video && !info.audio) {
          outcomes.push({ sourceId, status: "skipped", from: "asset", code: "not-time-based", message: `${rel3} is not time-based media` });
          continue;
        }
        const vfr = await detectVfr(tools, { file: abs2 }, info);
        outcomes.push(record(toMediaFacts(info, vfr.vfr, "asset", now), "asset", vfr.basis));
        continue;
      }
      const videoId = normalizeCutProjectVideoId(String(entry.videoId));
      const local = await findOriginal(ctx.root, videoId);
      if (local) {
        const info = await probeStreams(tools, local);
        const vfr = await detectVfr(tools, { file: local }, info);
        const stat = await fs28.stat(local);
        const rel3 = path27.relative(ctx.root, local).split(path27.sep).join("/");
        const sha2563 = await cache.hash(rel3, local, stat.size, Math.round(stat.mtimeMs));
        outcomes.push(record(toMediaFacts(info, vfr.vfr, "original", now), "local-original", vfr.basis, { size: stat.size, sha256: sha2563 }));
        continue;
      }
      const remote = originals.get(videoId);
      if (remote) {
        const info = await probeStreams(tools, remote.url);
        const vfr = await detectVfr(tools, { url: remote.url }, info);
        outcomes.push(record(toMediaFacts(info, vfr.vfr, "original", now), "remote-original", vfr.basis, { size: remote.size }));
        continue;
      }
      outcomes.push({
        sourceId,
        status: "skipped",
        code: "original-unavailable",
        message: `no local original in media/original/ and no original ticket for ${videoId}; run get_media_sources(kind original) and "darkmind-agent probe --ticket <ticket>" (reads only the header and index, no full download)`
      });
    } catch (error) {
      outcomes.push({ sourceId, status: "failed", code: error instanceof CliError ? error.code : "probe-failed", message: describeProbeError(error) });
    }
  }
  await cache.save();
  if (changed) await writeFileAtomic(sourcesAbs, `${JSON.stringify(doc, null, 2)}
`);
  const validation = await validateEditProject(projectReader(ctx.root));
  const failed = outcomes.filter((o) => o.status === "failed");
  const partial = outcomes.filter((o) => o.vfrBasis === "first-60s");
  const warnings = partial.map((o) => `${o.sourceId}: VFR was determined from the first 60 s only (container without sample table); the final render re-checks the downloaded original`);
  return {
    data: { written: changed ? sourcesRel : null, sources: outcomes, warnings, validation: { valid: validation.valid, ready: validation.ready, counts: validation.counts } },
    text: [
      `probe: ${outcomes.filter((o) => o.status === "recorded").length} recorded, ${outcomes.filter((o) => o.status === "unchanged").length} unchanged, ${outcomes.filter((o) => o.status === "skipped").length} skipped, ${failed.length} failed${changed ? ` \u2013 ${sourcesRel} updated` : ""}`,
      ...outcomes.map((o) => `  ${o.status.padEnd(9)} ${o.sourceId}${o.from ? ` (${o.from}${o.vfrBasis ? `, vfr from ${o.vfrBasis}` : ""})` : ""}${o.message ? `: ${o.message}` : ""}`),
      ...warnings.map((w) => `warning: ${w}`)
    ].join("\n"),
    exitCode: failed.length ? 1 : 0
  };
}
function parseMode(options) {
  if (options.proxy && options.original) throw new CliError("usage", "use either --proxy or --original");
  return options.original ? "original" : "proxy";
}
function parseSection(text3) {
  if (text3 === void 0) return null;
  const match = /^(\d+)[-:](\d+)$/.exec(text3.trim());
  if (!match) throw new CliError("usage", `--section "${text3}" must look like <fromFrame>-<toFrame> (end exclusive), e.g. 120-245`);
  const from = Number(match[1]);
  const to = Number(match[2]);
  if (to <= from) throw new CliError("usage", "--section: the end must be after the start");
  return { from, to };
}
async function planCommand(ctx, options, tools = defaultTools(ctx.env)) {
  const mode = parseMode(options);
  const cache = await HashCache.load(mediaHashCachePath(ctx.root));
  const result = await buildExecutionPlan({ root: ctx.root, mode, tools, hashes: { cache, computeOriginals: false } });
  const { toolchain, problems } = await detectToolchain(tools, ctx.env, { needFont: Boolean(result.plan?.captions.length) });
  const issues = [
    ...result.issues,
    ...problems.map((p) => ({ severity: p.code === "stt-model-missing" ? "warning" : "error", ...p }))
  ];
  const errors = issues.filter((i) => i.severity === "error");
  const plan = result.plan;
  let cached = 0;
  let segments = 0;
  if (plan && toolchain) {
    const fps2 = parseRational(plan.output.fps);
    const ranges = segmentRanges(0, plan.totalFrames, Number(fps2.n / fps2.d) * 10);
    segments = ranges.length;
    for (const range2 of ranges) {
      const key = segmentKey(plan, range2, { recipe: RENDER_RECIPES[mode], toolchain: toolchainKey(toolchain), captions: plan.captions.length > 0 });
      if (await fs28.stat(path27.join(ctx.root, "renders", RENDER_DIRS.cache, "segments", `${key}.mp4`)).catch(() => null)) cached++;
    }
  }
  const fps = plan ? parseRational(plan.output.fps) : null;
  const gate = evaluateGate(await computeReviewState(ctx.root, { validation: result.validation }), mode === "original" ? "render-original" : "render-proxy");
  const extensions = result.validation.valid ? (await inspectExtensions({ root: ctx.root, mode, tools, env: ctx.env }).catch(() => null))?.states.filter((s) => s.needed) ?? [] : [];
  const extensionLines = extensions.filter((s) => s.status !== "current").map(
    (s) => s.status === "blocked" ? `extension ${s.id}: blocked \u2013 ${s.reason}` : s.status === "restorable" ? `extension ${s.id}: render restores it from the cache` : s.trust.approved ? `extension ${s.id}: render runs it (${s.reason})` : `extension ${s.id}: needs a local approval before it runs (darkmind-agent extensions show ${s.id})`
  );
  const extensionApproval = extensions.find((s) => s.status === "stale" && !s.trust.approved);
  const lines = [
    plan ? `${mode} plan: ${plan.totalFrames} frames (${frameTimecode(plan.totalFrames, fps)}), ${plan.files.length} media files, ${plan.video.reduce((n, t) => n + t.clips.length, 0)} video / ${plan.audio.reduce((n, t) => n + t.clips.length, 0)} audio clips, ${plan.captions.length} captions; ${cached}/${segments} segments cached \u2013 ${errors.length ? "NOT renderable" : "renderable"}` : `${mode} plan: NOT renderable (${errors.length} errors)`,
    ...plan ? plan.files.map((f) => `  ${f.role.padEnd(9)} ${f.path}${f.offset !== "0" ? ` (offset ${f.offset} s)` : ""}`) : [],
    ...issues.map((i) => `${i.severity} ${i.code}${i.ref ? ` (${i.ref})` : ""}: ${i.message}`),
    ...result.needs.map((n) => `needs ${n.kind} of ${n.sourceId}: ${n.hint}`),
    ...extensionLines,
    ...!result.validation.valid ? result.validation.issues.filter((i) => i.severity === "error").slice(0, 20).map((i) => `  ${formatEditIssue(i)}`) : [],
    `review gate (render --${mode}): ${gate.status}${gate.basis !== "reviews" ? ` (${gate.basis})` : ""}`,
    ...gate.blockers.map((b) => `  - ${b.message}`)
  ];
  const listedIssues = capList(issues, 200);
  return {
    data: {
      mode,
      renderable: Boolean(plan) && errors.length === 0,
      ready: result.validation.ready,
      totalFrames: plan?.totalFrames ?? result.validation.totalFrames,
      segments: { total: segments, cached },
      issues: listedIssues.items,
      needs: result.needs,
      review: { gate },
      extensions: extensions.map((s) => ({ id: s.id, status: s.status, approved: s.trust.approved, reason: s.reason, problems: s.problems })),
      ...options.print || plan ? { plan } : {},
      next: extensionApproval ? `Show the extension command to the user and get their agreement: darkmind-agent extensions show ${extensionApproval.id}` : extensions.some((s) => s.status !== "current" && s.status !== "blocked") && errors.every((e) => e.ref && extensions.some((s) => s.id === e.ref)) ? `darkmind-agent extensions run (or render --${mode}, which runs them first)` : errors.length ? result.needs.length ? 'Load the missing media (needs[].hint), then run "darkmind-agent plan" again.' : 'Fix the errors, then run "darkmind-agent plan" again.' : gate.status === "blocked" ? "Get the missing reviews of the editor first (darkmind-agent review status)." : `darkmind-agent render --${mode}`
    },
    text: options.print && plan ? JSON.stringify(plan, null, 2) : lines.join("\n"),
    exitCode: plan && errors.length === 0 ? 0 : 1
  };
}
function describeChecks(report) {
  const lines = [];
  const { sync, transcription, changes } = report.checks;
  if (sync.status === "skipped") lines.push(`  sync: skipped (${"reason" in sync ? sync.reason : ""})`);
  else lines.push(`  sync: ${sync.status} (max ${sync.maxDeviationMs ?? "\u2013"} ms, tolerance ${sync.toleranceMs} ms, ${sync.clips.length} clips)`);
  if (transcription.status === "compared" && "hitRate" in transcription) {
    lines.push(`  transcription: hit rate ${((transcription.hitRate ?? 0) * 100).toFixed(1)} % (${transcription.matchedWords}/${transcription.expectedWords} words), ${transcription.deviations.length} captions with deviations`);
    for (const d of transcription.deviations.slice(0, 10)) {
      lines.push(`    ${d.captionId} at ${d.from}: ${d.matched}/${d.words}${d.missing.length ? ` missing "${d.missing.join(" ")}"` : ""}${d.heard.length ? ` heard "${d.heard.join(" ")}"` : ""}`);
    }
  } else lines.push(`  transcription: ${transcription.status}${"reason" in transcription && transcription.reason ? ` (${transcription.reason})` : ""}`);
  if (changes.status === "compared" && "changed" in changes) {
    lines.push(
      `  changes against ${changes.against}: ${changes.changed.length ? changes.changed.map((r) => `frames ${r.start}-${r.end} (${r.from}\u2013${r.to})`).join(", ") : "none"}`
    );
  } else lines.push(`  changes: ${changes.status}${"reason" in changes && changes.reason ? ` (${changes.reason})` : "against" in changes && changes.note ? ` (${changes.note})` : ""}`);
  const loudness = report.checks.loudness;
  if (loudness && "measured" in loudness) {
    lines.push(
      `  loudness: ${loudness.status} (${loudness.measured.integratedLufs.toFixed(1)} LUFS, true peak ${loudness.measured.truePeakDbtp.toFixed(1)} dBTP; target ${loudness.target.integratedLufs} \xB1${loudness.target.toleranceLu} LU, \u2264 ${loudness.target.truePeakDbtp} dBTP${report.audioMaster ? `, ${report.audioMaster.normalization} normalisation` : ""})`
    );
  } else if (loudness) lines.push(`  loudness: skipped (${loudness.reason})`);
  return lines;
}
async function renderCommand(ctx, options, tools = defaultTools(ctx.env)) {
  const mode = parseMode(options);
  const section = parseSection(options.section);
  let outcome;
  try {
    outcome = await renderProject({
      root: ctx.root,
      mode,
      tools,
      env: ctx.env,
      section,
      captions: !options.noCaptions,
      checks: !options.noChecks,
      signal: options.signal,
      progress: ctx.progress
    });
  } catch (error) {
    if (error instanceof CliError && error.code === "preflight-failed") {
      const details = error.details;
      const lines = [error.message, ...(details?.needs ?? []).map((n) => `needs: ${n.hint}`)];
      throw new CliError(error.code, lines.join("\n"), error.details);
    }
    throw error;
  }
  const { report } = outcome;
  const failedChecks = report.checks.sync.status === "fail" || report.checks.loudness?.status === "fail";
  const warnings = report.preflight.filter((i) => i.severity === "warning");
  const gate = report.review.gate;
  const next = section ? null : mode === "original" ? "Show the final output to the editor: darkmind-agent review show final" : "Show the preview to the editor: darkmind-agent review show preview (plus captions-text, and editorial for a recipe first pass)";
  return {
    data: {
      status: outcome.status,
      output: outcome.output,
      report: outcome.reportFile,
      mode,
      section: report.section,
      frames: report.frames,
      durationSeconds: report.durationSeconds,
      sha256: report.sha256,
      cache: report.cache,
      timings: report.timings,
      checks: report.checks,
      warnings,
      review: report.review,
      next
    },
    text: [
      `${outcome.status === "unchanged" ? "unchanged" : "rendered"} ${outcome.output} (${report.frames} frames, ${report.durationSeconds} s, ${formatBytes(report.size)}; ${report.cache.reused}/${report.cache.segments} segments from cache, ${report.timings.totalSeconds} s) \u2013 report ${outcome.reportFile}`,
      ...outcome.status === "rendered" ? describeChecks(report) : [],
      ...warnings.map((w) => `warning ${w.code}${w.ref ? ` (${w.ref})` : ""}: ${w.message}`),
      ...gate ? [`review gate: ${gate.basis === "reviews" ? `passed (${gate.approvals.length} approvals)` : gate.basis}`, ...gate.notes.map((n) => `note: ${n}`)] : [],
      mode === "original" ? "The final output is NOT approved yet: the editor approves it after viewing it." : "",
      next ? `next: ${next}` : ""
    ].filter(Boolean).join("\n"),
    exitCode: failedChecks ? 1 : 0
  };
}

// src/commands/extensions.ts
var ACTIONS = ["status", "show", "approve", "run"];
function label(state) {
  if (state.status === "blocked") return "blocked";
  if (state.status === "stale" && !state.trust.approved) return "approval";
  return state.status;
}
function describeCommand(state, program, args) {
  return [program, ...args].map((part) => /\s/.test(part) ? `"${part}"` : part).join(" ") + (state.trust.execution?.program.resolved ? `  (program: ${state.trust.execution.program.resolved})` : "");
}
function summary2(state) {
  return {
    id: state.id,
    file: state.file,
    needed: state.needed,
    status: state.status,
    approved: state.trust.approved,
    ...state.trust.basis ? { approvedBy: state.trust.basis } : {},
    ...state.trust.brandPack ? { brandPack: state.trust.brandPack } : {},
    reason: state.reason,
    output: state.output,
    key: state.key,
    modeDependent: state.modeDependent,
    problems: state.problems,
    warnings: state.warnings,
    ...state.trust.approved ? {} : { approval: { hash: state.trust.hash, changes: state.trust.changes } }
  };
}
async function extensionsCommand(ctx, action, ids, options, tools = defaultTools(ctx.env)) {
  const verb = action ?? "status";
  if (!ACTIONS.includes(verb)) throw new CliError("usage", `extensions takes ${ACTIONS.join(", ")}, not "${verb}"`);
  const mode = parseMode(options);
  const base = { root: ctx.root, mode, tools, env: ctx.env };
  if (verb === "status") {
    if (ids.length) throw new CliError("usage", 'extensions status takes no extension IDs (use "extensions show <id>")');
    const inspection2 = await inspectExtensions(base);
    const states = inspection2.states;
    const stills = new Set(stillImageExtensions(inspection2.validation.documents?.extensions ?? []).map((e) => e.id));
    const pending = states.filter((s) => s.needed && s.status !== "current");
    const approvals = states.filter((s) => s.status === "stale" && !s.trust.approved && s.trust.hash);
    const next = approvals.length ? `Show the commands to the user and get their agreement: darkmind-agent extensions show ${approvals[0].id}` : states.some((s) => s.status === "blocked") ? "Fix the problems of the blocked extensions (missing inputs are restored from the archive or loaded as media, never regenerated)." : pending.length ? `darkmind-agent extensions run (render does it for the timeline, too)` : null;
    return {
      data: { mode, extensions: states.map(summary2), next },
      text: [
        `extensions (${mode}): ${states.length} listed, ${states.filter((s) => s.needed).length} used by the timeline`,
        ...states.map((s) => `  ${label(s).padEnd(10)} ${s.id.padEnd(24)} ${s.needed ? "" : stills.has(s.id) ? "(still image, thumbnail review) " : "(not in the timeline) "}${s.status === "current" ? s.output.path : s.reason}`),
        ...states.flatMap((s) => s.warnings.map((w) => `warning ${w.code} (${s.id}): ${w.message}`)),
        next ? `next: ${next}` : ""
      ].filter(Boolean).join("\n")
    };
  }
  if (verb === "run") {
    if (mode === "original") {
      const state2 = await computeReviewState(ctx.root);
      const stills = stillImageExtensions(state2.validation.documents?.extensions ?? []).map((e) => e.id);
      if (stills.some((id3) => !ids.length || ids.includes(id3))) {
        const gate = evaluateGate(state2, "still-original");
        if (gate.status === "blocked") throw gateError(gate);
      }
    }
    const release = await acquireLock(path28.join(ctx.root, "renders", ".lock"));
    try {
      const result = await runExtensions({ ...base, only: ids, force: options.force, signal: options.signal, progress: ctx.progress });
      const approvals = result.results.filter((r) => r.approval);
      return {
        data: { ...result, next: approvals.length ? `Show the commands to the user and get their agreement: darkmind-agent extensions show ${approvals[0].id}` : null },
        text: [
          `extensions run (${mode}): ${result.results.filter((r) => r.action === "rendered").length} rendered, ${result.results.filter((r) => r.action === "restored").length} restored from the cache, ${result.results.filter((r) => r.action === "current").length} current, ${result.results.filter((r) => ["blocked", "failed", "skipped"].includes(r.action)).length} not up to date`,
          ...result.results.map((r) => `  ${r.action.padEnd(9)} ${r.id.padEnd(24)} ${r.problems.length ? r.problems.map((p) => `[${p.code}] ${p.message}`).join("; ") : `${r.output}${r.durationMs !== void 0 ? ` (${(r.durationMs / 1e3).toFixed(1)} s)` : ""}`}`)
        ].join("\n"),
        exitCode: result.ok ? 0 : 1
      };
    } finally {
      await release();
    }
  }
  if (ids.length !== 1) throw new CliError("usage", `extensions ${verb} takes exactly one extension ID`);
  const id2 = ids[0];
  const inspection = await inspectExtensions({ ...base, only: [id2] });
  const state = inspection.states.find((s) => s.id === id2);
  const extension = inspection.validation.documents.extensions.find((e) => e.id === id2);
  if (verb === "show") {
    const execution = state.trust.execution;
    const code = execution ? Object.entries(execution.code) : [];
    const data = Object.entries(state.inputs.files).filter(([file]) => !execution || !(file in execution.code));
    return {
      data: {
        ...summary2(state),
        command: { program: extension.command.program, args: extension.command.args, resolved: execution?.program.resolved ?? null },
        tools: execution?.tools ?? [],
        code: execution?.code ?? {},
        inputs: state.inputs,
        parameters: extension.parameters ?? {},
        contract: extension.output,
        hash: state.trust.hash,
        lastRun: state.record,
        note: "The runner is no sandbox: an approved command runs with the rights of the user. Approve only after the user has seen the command and agreed."
      },
      text: [
        `extension ${id2} (${state.file}) \u2013 ${label(state)}: ${state.reason}`,
        `  ${extension.description}`,
        `command: ${describeCommand(state, extension.command.program, extension.command.args)}`,
        ...execution?.tools.length ? [`tools: ${execution.tools.map((t) => `${t.name} ${t.version ?? "?"}${t.required ? ` (needs ${t.required})` : ""}`).join(", ")}`] : [],
        `scripts and other code inputs (covered by the approval):`,
        ...code.length ? code.map(([file, sha2]) => `  ${file}  sha256:${sha2?.slice(0, 16) ?? "missing"}`) : ["  (none)"],
        ...data.length ? ["data inputs:", ...data.map(([file]) => `  ${file}`)] : [],
        ...Object.entries(state.inputs.sources).map(([sourceId, s]) => `source ${sourceId}: ${s.path} (${s.role}${s.offset !== "0" ? `, offset ${s.offset} s` : ""})`),
        ...Object.entries(state.inputs.extensions).map(([upstream, e]) => `input extension ${upstream}: ${e.path}`),
        extension.output.image ? `output: ${extension.output.path} \u2013 still image ${extension.output.width}x${extension.output.height} PNG, alpha ${extension.output.alpha ? "yes" : "no"} (not on the timeline; thumbnail review)` : `output: ${extension.output.path} \u2013 ${extension.output.width}x${extension.output.height}, ${extension.output.fps} fps, ${extension.output.durationFrames} frames, audio ${extension.output.audio ? "yes" : "no"}, alpha ${extension.output.alpha ? "yes" : "no"}`,
        ...state.problems.map((p) => `problem [${p.code}]: ${p.message}`),
        ...state.warnings.map((w) => `warning [${w.code}]: ${w.message}`),
        state.trust.basis === "brand-pack" ? "approval: not needed \u2013 unchanged Loud Society brand block (byte-identical to the brand pack of the installed skill)" : state.trust.approved ? "approval: the command is approved in this folder" : state.trust.hash ? `approval: required \u2013 ${state.trust.changes.join("; ")}${state.trust.brandPack ? ` (no unchanged brand block: ${state.trust.brandPack})` : ""}` : "approval: not possible until the problems are fixed",
        ...state.trust.hash ? [`hash: ${state.trust.hash}`] : [],
        ...state.record ? [`last run of this state: ${state.record.createdAt}, ${(state.record.durationMs / 1e3).toFixed(1)} s, sha256:${state.record.sha256.slice(0, 16)}`] : [],
        ...!state.trust.approved && state.trust.hash ? [
          "The runner is no sandbox: an approved command runs with your user rights. Read the scripts; approve only after the user agreed:",
          `  darkmind-agent extensions approve ${id2} --hash ${state.trust.hash.slice(0, 12)} --yes`
        ] : []
      ].join("\n")
    };
  }
  if (!options.hash || options.hash.length < 12) throw new CliError("usage", 'extensions approve needs --hash with at least 12 characters of the hash shown by "darkmind-agent extensions show"');
  if (!state.trust.hash) throw new CliError("extension-not-approvable", `extension "${id2}" cannot be approved: ${state.problems.map((p) => p.message).join("; ")}`);
  if (!state.trust.hash.startsWith(options.hash.toLowerCase())) {
    throw new CliError("hash-mismatch", `the command or scripts of "${id2}" changed since they were shown (current hash ${state.trust.hash.slice(0, 12)}); show them again`, { hash: state.trust.hash, changes: state.trust.changes });
  }
  if (state.trust.approved) {
    return { data: { id: id2, status: "already-approved", hash: state.trust.hash }, text: `extension ${id2}: already approved in this folder` };
  }
  let method;
  if (options.yes) method = "flag";
  else if (ctx.prompt) {
    const answer = await ctx.prompt(`Allow extension "${id2}" to run "${[extension.command.program, ...extension.command.args].join(" ")}" with the shown scripts in this folder? Type "run" to approve: `);
    if (answer?.trim().toLowerCase() !== "run") throw new CliError("not-approved", "not approved (nothing was recorded)");
    method = "terminal";
  } else {
    throw new CliError("confirmation-required", "run this in an interactive terminal, or pass --yes after the user has seen the command and scripts and agreed");
  }
  const approval = await recordApproval(ctx.root, state, method);
  return {
    data: { id: id2, status: "approved", hash: approval.hash, method, approvedAt: approval.approvedAt, next: `darkmind-agent extensions run ${id2}` },
    text: `extension ${id2}: approved in this folder (${method}); the approval ends when the command, a script or a tool changes
next: darkmind-agent extensions run ${id2}`
  };
}

// src/commands/levels.ts
import { promises as fs29 } from "node:fs";
import path29 from "node:path";
var DEFAULT_REFERENCE_LUFS = -14 - DIALOG_BELOW_TARGET_DB;
var QUIET_SOURCE_GAIN_DB = 20;
async function levelsCommand(ctx, options, tools = defaultTools(ctx.env)) {
  const mode = parseMode(options);
  const result = await buildExecutionPlan({ root: ctx.root, mode, tools, withoutExtensionOutputs: true });
  const plan = result.plan;
  if (!plan) {
    const problems = [...result.validation.issues.filter((i) => i.severity === "error").map(formatEditIssue), ...result.issues.filter((i) => i.severity === "error").map((i) => i.message)];
    throw new CliError("plan-failed", `no ${mode} plan: ${problems.slice(0, 5).join("; ") || "see darkmind-agent plan"}`, { needs: result.needs });
  }
  let reference = plan.audioMaster ? plan.audioMaster.integratedLufs - DIALOG_BELOW_TARGET_DB : DEFAULT_REFERENCE_LUFS;
  if (options.target !== void 0) {
    reference = Number(options.target);
    if (!Number.isFinite(reference) || reference > 0 || reference < -60) throw new CliError("usage", "--target must be a loudness in LUFS between -60 and 0, e.g. -16");
  }
  const fps = parseRational(plan.output.fps);
  const fpsValue = Number(fps.n) / Number(fps.d);
  const clips = [];
  for (const track of plan.audio.filter((t) => t.role === "dialog")) {
    for (const clip of track.clips) {
      const file = plan.files[clip.file];
      if (!file) continue;
      const inLocal = parseRational(clip.inLocal);
      const seconds2 = clip.frames / fpsValue;
      const measured = await measureLoudness(tools, path29.join(ctx.root, file.path), { range: { from: Number(inLocal.n) / Number(inLocal.d), seconds: seconds2 } });
      const gain = dialogGain(measured.integratedLufs, reference);
      const current = clip.gainDb ?? 0;
      const proposed = gain ?? current;
      clips.push({
        id: clip.id,
        trackId: track.id,
        ...clip.statementId ? { statementId: clip.statementId } : {},
        seconds: Math.round(seconds2 * 100) / 100,
        measuredLufs: Number.isFinite(measured.integratedLufs) ? Math.round(measured.integratedLufs * 10) / 10 : null,
        gainDb: current,
        proposedGainDb: proposed,
        changed: Math.abs(proposed - current) >= 0.5
      });
    }
  }
  const changed = clips.filter((c) => c.changed);
  let applied = false;
  if (options.apply && changed.length) {
    const projectFile = path29.join(ctx.root, "project.json");
    const project = JSON.parse((await fs29.readFile(projectFile, "utf8")).replace(/^\uFEFF/, ""));
    const timelineFile = path29.join(ctx.root, project.artifacts?.timeline ?? "timeline.json");
    const timeline = JSON.parse((await fs29.readFile(timelineFile, "utf8")).replace(/^\uFEFF/, ""));
    const byId = new Map(changed.map((c) => [`${c.trackId}/${c.id}`, c.proposedGainDb]));
    for (const track of timeline.audio) for (const clip of track.clips) {
      const gain = byId.get(`${track.id}/${clip.id}`);
      if (gain !== void 0) clip.gainDb = gain;
    }
    await writeFileAtomic(timelineFile, `${JSON.stringify(timeline, null, 2)}
`);
    applied = true;
  }
  const silent = clips.filter((c) => c.measuredLufs === null).map((c) => c.id);
  const quiet = clips.filter((c) => c.measuredLufs !== null && c.proposedGainDb >= QUIET_SOURCE_GAIN_DB);
  const warnings = quiet.length ? [
    `${quiet.length} of ${clips.length} dialog clips are very quiet (${quiet.map((c) => `${c.id} ${c.measuredLufs} LUFS`).join(", ")}): probably the distant camera microphone \u2013 the gain lifts the noise as well. Tell the editor; a separately recorded sound (if the production has one) would be better.`
  ] : [];
  const lines = [
    `dialogue reference ${reference} LUFS (${options.target !== void 0 ? "--target" : plan.audioMaster ? `audio_master ${plan.audioMaster.integratedLufs} LUFS \u2212 ${DIALOG_BELOW_TARGET_DB} dB` : "house default"}), ${clips.length} dialog clips measured from the ${mode} media`,
    ...clips.map((c) => `  ${c.id}${c.statementId ? ` (${c.statementId})` : ""}: ${c.measuredLufs === null ? "silent \u2013 gain kept" : `${c.measuredLufs} LUFS`}, gain ${c.gainDb} dB${c.changed ? ` \u2192 ${c.proposedGainDb} dB` : ""}`),
    changed.length ? applied ? `timeline.json: ${changed.length} clip gains written` : `${changed.length} clip gains differ \u2013 run again with --apply to write them` : "all dialog clips are at the reference",
    ...warnings.map((w) => `warning: ${w}`)
  ];
  return {
    data: {
      mode,
      referenceLufs: reference,
      clips,
      changed: changed.length,
      applied,
      silent,
      quiet: quiet.map((c) => c.id),
      warnings,
      next: applied || !changed.length ? "Render the proxy again; a gain change needs only the preview review (no new editorial review)" : "darkmind-agent levels --apply"
    },
    text: lines.join("\n"),
    exitCode: 0
  };
}

// src/commands/plugin.ts
import { execFile } from "node:child_process";
import { promises as fs30 } from "node:fs";
import os3 from "node:os";
import path30 from "node:path";
var PLUGIN_NAME = "darkmind";
var PLUGIN_MARKETPLACE = "darkmind";
var PLUGIN_ID = `${PLUGIN_NAME}@${PLUGIN_MARKETPLACE}`;
var PLUGIN_ZIP_NAME = "darkmind-plugin.zip";
var PLUGIN_SKILL_PATH = path30.join("plugins", PLUGIN_NAME, "skills", SKILL_NAME);
var MARKETPLACE_FILE = ".claude-plugin/marketplace.json";
var PLUGIN_MANIFEST = `plugins/${PLUGIN_NAME}/.claude-plugin/plugin.json`;
var MAX_ARCHIVE_BYTES2 = 100 * 1024 * 1024;
var CLIENTS = ["copilot", "claude"];
var CLIENT_LABELS = { copilot: "GitHub Copilot", claude: "Claude Code" };
function homeDir(env, platform) {
  return (platform === "win32" ? env.USERPROFILE : env.HOME) || env.HOME || os3.homedir();
}
function pluginHome(ctx, to, platform = process.platform) {
  if (to) return path30.resolve(ctx.root, to);
  if (ctx.env.DARKMIND_PLUGIN_HOME) return path30.resolve(ctx.env.DARKMIND_PLUGIN_HOME);
  return path30.join(homeDir(ctx.env, platform), ".darkmind", "marketplace");
}
var defaultRunner = (command, args, env) => new Promise((resolve, reject) => {
  const done = (error, stdout, stderr) => {
    if (error && (error.code === "ENOENT" || error.code === "EINVAL") && process.platform === "win32" && !/\.exe$/i.test(command)) {
      const line = [command, ...args].map((part) => `"${part.replace(/"/g, '""')}"`).join(" ");
      execFile(line, [], { env, shell: true, windowsHide: true, timeout: 18e4, maxBuffer: 16 * 1024 * 1024 }, (shellError, out, err) => {
        if (shellError && typeof shellError.code !== "number") reject(shellError);
        else resolve({ code: shellError ? Number(shellError.code) : 0, stdout: out, stderr: err });
      });
      return;
    }
    if (error && typeof error.code !== "number") reject(error);
    else resolve({ code: error ? Number(error.code) : 0, stdout, stderr });
  };
  execFile(command, args, { env, windowsHide: true, timeout: 18e4, maxBuffer: 16 * 1024 * 1024 }, done);
});
async function clientCandidates(client, env, platform) {
  const variable = client === "copilot" ? env.DARKMIND_COPILOT : env.DARKMIND_CLAUDE;
  if (variable) return [variable];
  if (client === "copilot") return ["copilot"];
  const home = homeDir(env, platform);
  const exe = platform === "win32" ? "claude.exe" : "claude";
  const candidates = ["claude", path30.join(home, ".local", "bin", exe)];
  if (platform === "win32" && env.LOCALAPPDATA) {
    const base = path30.join(env.LOCALAPPDATA, "Claude-Data");
    const found = [];
    for (const id2 of await fs30.readdir(base).catch(() => [])) {
      const codeDir = path30.join(base, id2, "claude-code");
      for (const version of await fs30.readdir(codeDir).catch(() => [])) {
        if (!/^\d+(\.\d+)*$/.test(version)) continue;
        for (const hash of await fs30.readdir(path30.join(codeDir, version)).catch(() => [])) {
          const file = path30.join(codeDir, version, hash, exe);
          if (await fs30.stat(file).catch(() => null)) found.push({ version: version.split(".").map(Number), file });
        }
      }
    }
    found.sort((a, b) => compareVersions2(b.version, a.version));
    candidates.push(...found.map((item) => item.file));
  }
  return candidates;
}
function compareVersions2(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) - (b[i] ?? 0);
  return 0;
}
async function findClient(client, env, run2, platform) {
  for (const candidate of await clientCandidates(client, env, platform)) {
    try {
      if ((await run2(candidate, ["--version"], env)).code === 0) return candidate;
    } catch {
    }
  }
  return null;
}
function parseJsonArray(text3) {
  const start = text3.indexOf("[");
  if (start < 0) return [];
  try {
    const value2 = JSON.parse(text3.slice(start));
    return Array.isArray(value2) ? value2 : [];
  } catch {
    return [];
  }
}
async function runChecked(run2, command, args, env) {
  const result = await run2(command, args, env);
  if (result.code !== 0) throw new Error(`"${path30.basename(command)} ${args.join(" ")}" failed: ${(result.stderr || result.stdout).trim().split("\n").slice(-3).join(" ")}`);
  return result;
}
function samePath(a, b) {
  const normalize = (value2) => path30.resolve(value2).replace(/[\\/]+$/, "");
  return process.platform === "win32" ? normalize(a).toLowerCase() === normalize(b).toLowerCase() : normalize(a) === normalize(b);
}
function describeSource(source) {
  return source.kind === "local" ? source.dir : source.value;
}
function manualCommands(client, source) {
  return [`${client} plugin marketplace add "${describeSource(source)}"`, `${client} plugin install ${PLUGIN_ID}`];
}
function sameSource(client, row, source) {
  if (source.kind === "local") {
    const location = client === "claude" ? String(row.path ?? "") : String(row.source ?? "").replace(/^Local:\s*/, "");
    return Boolean(location) && samePath(location, source.dir);
  }
  const wanted = source.value.replace(/\/+$/, "").toLowerCase();
  const values = [row.url, row.repo, row.source, row.path].filter((v) => typeof v === "string").map((v) => v.replace(/^GitHub:\s*/i, "").replace(/\/+$/, "").toLowerCase());
  return values.some((value2) => value2 === wanted || value2 === `https://github.com/${wanted}` || value2 === `https://github.com/${wanted}.git`);
}
async function clientState(client, command, source, env, run2) {
  const marketplaces = parseJsonArray((await runChecked(run2, command, ["plugin", "marketplace", "list", "--json"], env)).stdout);
  const plugins = parseJsonArray((await runChecked(run2, command, ["plugin", "list", "--json"], env)).stdout);
  const marketplace = marketplaces.find((item) => item.name === PLUGIN_MARKETPLACE);
  const location = marketplace ? String(marketplace.url ?? marketplace.path ?? marketplace.repo ?? marketplace.source ?? "") : null;
  const plugin = plugins.find((item) => client === "claude" ? item.id === PLUGIN_ID : item.name === PLUGIN_NAME && item.marketplace === PLUGIN_MARKETPLACE);
  return {
    marketplace: marketplace ? sameSource(client, marketplace, source) ? "here" : "elsewhere" : "missing",
    location,
    plugin: plugin ? plugin.enabled === false ? "disabled" : "enabled" : "missing",
    version: plugin && typeof plugin.version === "string" ? plugin.version : null
  };
}
async function registerClient(client, command, source, update, env, run2) {
  const report = { client, label: CLIENT_LABELS[client], command, source: describeSource(source) };
  const state = await clientState(client, command, source, env, run2);
  if (state.marketplace === "elsewhere") {
    await runChecked(run2, command, ["plugin", "marketplace", "remove", PLUGIN_MARKETPLACE, ...client === "copilot" ? ["--force"] : []], env);
  }
  if (state.marketplace !== "here") await runChecked(run2, command, ["plugin", "marketplace", "add", describeSource(source)], env);
  report.marketplace = state.marketplace === "here" ? "present" : state.marketplace === "elsewhere" ? "replaced" : "added";
  if (state.plugin === "missing" || state.marketplace === "elsewhere") {
    await runChecked(run2, command, ["plugin", "install", PLUGIN_ID], env);
    report.plugin = "installed";
  } else if (update && source.kind === "remote") {
    await runChecked(run2, command, ["plugin", "marketplace", "update", PLUGIN_MARKETPLACE], env);
    await runChecked(run2, command, ["plugin", "update", PLUGIN_ID], env);
    report.plugin = "updated";
  } else report.plugin = state.plugin === "disabled" ? "disabled" : "present";
  return report;
}
async function fetchPluginClients(server) {
  try {
    const response = await httpRequest(`${server}/plugins/clients.json`, { headers: { Accept: "application/json" }, timeoutMs: 3e4 });
    const body = await readBody(response, 1024 * 1024);
    if (response.statusCode !== 200) return null;
    const data = JSON.parse(body.toString("utf8"));
    const text3 = (value2) => typeof value2 === "string" && value2 ? value2 : null;
    return { claude: text3(data.claude?.marketplace), copilot: text3(data.copilot?.marketplace), version: text3(data.version) };
  } catch {
    return null;
  }
}
function sameServer(url, server) {
  return typeof url === "string" && url.replace(/\/+$/, "").toLowerCase() === `${server}/mcp`.toLowerCase();
}
async function detectLegacySetup(env, server, platform = process.platform) {
  const home = homeDir(env, platform);
  const legacy = { skillFolders: [], mcpEntries: [] };
  for (const [client, base] of [
    ["copilot", env.COPILOT_HOME || path30.join(home, ".copilot")],
    ["claude", env.CLAUDE_CONFIG_DIR || path30.join(home, ".claude")]
  ]) {
    const folder = path30.join(base, "skills", SKILL_NAME);
    if (await fs30.stat(path30.join(folder, "SKILL.md")).catch(() => null)) legacy.skillFolders.push({ client, folder });
  }
  const copilotConfig = path30.join(env.COPILOT_HOME || path30.join(home, ".copilot"), "mcp-config.json");
  const copilot = await readJsonFile(copilotConfig).catch(() => null);
  for (const [name, entry] of Object.entries(copilot?.mcpServers ?? {})) {
    if (sameServer(entry?.url, server)) legacy.mcpEntries.push({ client: "copilot", name, file: copilotConfig });
  }
  const claudeConfig = env.CLAUDE_CONFIG_DIR ? path30.join(env.CLAUDE_CONFIG_DIR, ".claude.json") : path30.join(home, ".claude.json");
  const claude = await readJsonFile(claudeConfig).catch(() => null);
  for (const [name, entry] of Object.entries(claude?.mcpServers ?? {})) {
    if (sameServer(entry?.url, server)) legacy.mcpEntries.push({ client: "claude", name, file: claudeConfig });
  }
  return legacy;
}
async function downloadPlugin(ctx, server) {
  try {
    return await withRetry(
      async () => {
        const response = await httpRequest(`${server}/downloads/${PLUGIN_ZIP_NAME}`, { headers: { Accept: "application/zip" }, timeoutMs: 12e4 });
        if ((response.statusCode ?? 0) >= 400) throw await toHttpError(response, "Plugin download failed");
        return await readBody(response, MAX_ARCHIVE_BYTES2);
      },
      { attempts: 3 }
    );
  } catch (error) {
    if (error instanceof HttpError) {
      throw new CliError(error.status === 404 ? "plugin-not-available" : `http-${error.status}`, error.status === 404 ? `${server} does not serve the Dark Mind plugin.` : error.message, { status: error.status });
    }
    throw new CliError("network-error", `Cannot reach ${server}: ${error.message}`);
  }
}
async function readInstalled(dir) {
  const plugin = await readJsonFile(path30.join(dir, ...PLUGIN_MANIFEST.split("/"))).catch(() => null);
  if (!plugin) return null;
  const skill = await readJsonFile(path30.join(dir, PLUGIN_SKILL_PATH, "skill.json")).catch(() => null);
  return { version: typeof plugin.version === "string" ? plugin.version : null, server: typeof skill?.server === "string" ? skill.server : null };
}
async function listTree(dir, prefix = "") {
  const files = [];
  for (const entry of await fs30.readdir(path30.join(dir, prefix), { withFileTypes: true }).catch(() => [])) {
    const relative = path30.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await listTree(dir, relative));
    else files.push(relative);
  }
  return files;
}
async function swapInto(staging, target) {
  if (!await fs30.stat(target).catch(() => null)) {
    await fs30.mkdir(path30.dirname(target), { recursive: true });
    await fs30.rename(staging, target);
    return;
  }
  const old = `${target}.old-${process.pid}`;
  try {
    await fs30.rename(target, old);
  } catch {
    const keep = new Set((await listTree(staging)).map((file) => file.toLowerCase()));
    await fs30.cp(staging, target, { recursive: true, force: true });
    for (const file of await listTree(target)) if (!keep.has(file.toLowerCase())) await fs30.rm(path30.join(target, file), { force: true });
    await fs30.rm(staging, { recursive: true, force: true });
    return;
  }
  await fs30.rename(staging, target);
  await fs30.rm(old, { recursive: true, force: true });
}
async function pluginCommand(ctx, action, options = {}, deps = {}) {
  const run2 = deps.run ?? defaultRunner;
  const platform = deps.platform ?? process.platform;
  if (action !== "install" && action !== "update" && action !== "status") {
    throw new CliError("usage", `plugin takes "install", "update" or "status", not "${action ?? ""}"`);
  }
  const clients = (options.clients ?? CLIENTS).flatMap((value2) => value2.split(",")).map((value2) => value2.trim().toLowerCase()).filter(Boolean);
  for (const client of clients) if (!CLIENTS.includes(client) && client !== "none") throw new CliError("usage", `--client takes copilot, claude or none, not "${client}"`);
  const selected = CLIENTS.filter((client) => clients.includes(client));
  const dir = pluginHome(ctx, options.to, platform);
  const server = resolveServer(ctx.server, await readConfig(ctx.root).catch(() => null), ctx.env);
  const legacy = await detectLegacySetup(ctx.env, server, platform);
  const served = await fetchPluginClients(server);
  const sources = Object.fromEntries(
    CLIENTS.map((client) => {
      const remote = options.local ? null : client === "claude" ? served?.claude : served?.copilot;
      return [client, remote ? { kind: "remote", value: remote } : { kind: "local", dir }];
    })
  );
  const ctxs = { ctx, dir, server, legacy, sources, run: run2, platform };
  return action === "status" ? statusOf(ctxs, selected) : install(ctxs, selected, action === "update", options, deps.scriptPath);
}
async function installLocalFolder(ctx, dir, server) {
  ctx.progress(`downloading the Dark Mind plugin from ${server}`);
  const archive = await downloadPlugin(ctx, server);
  const entries = readZip(archive, "plugin archive");
  const manifest = entries.find((entry) => entry.name === PLUGIN_MANIFEST);
  if (!entries.some((entry) => entry.name === MARKETPLACE_FILE) || !manifest) {
    throw new CliError("invalid-archive", `The plugin archive of ${server} has no ${MARKETPLACE_FILE} or ${PLUGIN_MANIFEST}.`);
  }
  const staging = `${dir}.tmp-${process.pid}`;
  await fs30.rm(staging, { recursive: true, force: true });
  for (const entry of entries) {
    const file = path30.join(staging, ...entry.name.split("/"));
    await fs30.mkdir(path30.dirname(file), { recursive: true });
    await fs30.writeFile(file, entry.data);
  }
  await swapInto(staging, dir);
  return JSON.parse(manifest.data.toString("utf8")).version ?? null;
}
async function install(p, clients, update, options, scriptPath) {
  const { ctx, dir, server, legacy, sources, run: run2, platform } = p;
  const brandAssets = await migrateBrandAssets(ctx.env, scriptPath, platform);
  const previous = await readInstalled(dir);
  const usesLocal = clients.some((client) => sources[client].kind === "local");
  const localVersion = usesLocal ? await installLocalFolder(ctx, dir, server) : null;
  const problems = [];
  const reports = [];
  for (const client of clients) {
    const source = sources[client];
    const command = await findClient(client, ctx.env, run2, platform);
    if (!command) {
      reports.push({ client, label: CLIENT_LABELS[client], command: null, source: describeSource(source), manual: manualCommands(client, source) });
      continue;
    }
    try {
      ctx.progress(`registering the plugin in ${CLIENT_LABELS[client]} (${describeSource(source)})`);
      reports.push(await registerClient(client, command, source, update, ctx.env, run2));
    } catch (error) {
      problems.push(`${CLIENT_LABELS[client]}: ${error.message}`);
      reports.push({ client, label: CLIENT_LABELS[client], command, source: describeSource(source), error: error.message, manual: manualCommands(client, source) });
    }
  }
  let removedLocal = false;
  if (!usesLocal && previous && clients.length === CLIENTS.length && reports.every((report) => report.plugin)) {
    await fs30.rm(dir, { recursive: true, force: true });
    removedLocal = true;
  }
  const removed = [];
  if (options.removeLegacy) {
    for (const report of reports.filter((item) => item.plugin && item.command)) {
      for (const { folder } of legacy.skillFolders.filter((item) => item.client === report.client)) {
        await fs30.rm(folder, { recursive: true, force: true });
        removed.push(folder);
      }
      for (const entry of legacy.mcpEntries.filter((item) => item.client === report.client)) {
        try {
          await runChecked(run2, report.command, ["mcp", "remove", entry.name, ...report.client === "claude" ? ["-s", "user"] : []], ctx.env);
          (report.removedLegacyMcp ??= []).push(entry.name);
          removed.push(`MCP server "${entry.name}" (${report.label})`);
        } catch (error) {
          problems.push(`${report.label}: ${error.message}`);
        }
      }
    }
  }
  const remaining = await detectLegacySetup(ctx.env, server, platform);
  const hasLegacy = remaining.skillFolders.length + remaining.mcpEntries.length > 0;
  const registered = reports.filter((report) => report.plugin);
  const next = [
    ...registered.length ? ['Restart the client (or start a new session); the skill darkmind-editing and the MCP server "darkmind" are there.'] : [],
    ...registered.map(
      (report) => report.client === "copilot" ? "GitHub Copilot: sign in to Dark Mind with /mcp \u2192 darkmind (or on the first Dark Mind tool call)." : 'Claude Code: sign in to Dark Mind with "claude mcp login plugin:darkmind:darkmind" or /mcp \u2192 plugin:darkmind:darkmind \u2192 Authenticate.'
    ),
    ...hasLegacy && !options.removeLegacy ? ["An older manual setup is still there (see legacy). After checking the plugin, remove it: darkmind-agent plugin install --remove-legacy"] : []
  ];
  return {
    data: {
      status: update ? "updated" : previous || reports.some((report) => report.plugin === "present") ? "updated" : "installed",
      server,
      plugin: PLUGIN_ID,
      localFolder: usesLocal ? { dir, version: localVersion } : null,
      removedLocalFolder: removedLocal ? dir : null,
      brandAssets: { dir: brandAssets.dir, installed: Boolean(brandAssets.marker), ...brandAssets.migratedFrom ? { migratedFrom: brandAssets.migratedFrom } : {} },
      clients: reports,
      legacy: remaining,
      removed,
      problems,
      next
    },
    text: [
      `Dark Mind plugin ${PLUGIN_ID} from ${server}`,
      ...usesLocal ? [`local marketplace folder: ${dir} (version ${localVersion ?? "?"})`] : [],
      ...removedLocal ? [`removed the old local marketplace folder ${dir}`] : [],
      `brand assets: ${brandAssets.marker ? `${brandAssets.dir}${brandAssets.migratedFrom ? ` (moved from ${brandAssets.migratedFrom})` : ""}` : "not installed (the agent installs them with get_brand_assets \u2192 darkmind-agent brand-assets)"}`,
      ...reports.map(
        (report) => report.command === null ? `${report.label}: not found \u2013 run: ${report.manual.join(" ; ")}` : report.error ? `${report.label} (${report.command}): failed \u2013 ${report.error}` : `${report.label} (${report.command}): marketplace ${report.marketplace} (${report.source}), plugin ${report.plugin}${report.removedLegacyMcp ? `, removed MCP ${report.removedLegacyMcp.join(", ")}` : ""}`
      ),
      ...removed.map((item) => `removed: ${item}`),
      ...remaining.skillFolders.map((item) => `legacy: skill folder ${item.folder}`),
      ...remaining.mcpEntries.map((item) => `legacy: MCP server "${item.name}" in ${item.file}`),
      ...problems.map((problem) => `problem: ${problem}`),
      ...next.map((step) => `next: ${step}`)
    ].join("\n"),
    exitCode: problems.length > 0 ? 1 : 0
  };
}
async function statusOf(p, clients) {
  const { ctx, dir, server, legacy, sources, run: run2, platform } = p;
  const installed = await readInstalled(dir);
  const served = await fetchServerAgentVersion(server);
  const reports = [];
  for (const client of clients) {
    const source = sources[client];
    const command = await findClient(client, ctx.env, run2, platform);
    if (!command) {
      reports.push({ client, label: CLIENT_LABELS[client], command: null, source: describeSource(source) });
      continue;
    }
    try {
      reports.push({ client, label: CLIENT_LABELS[client], command, source: describeSource(source), ...await clientState(client, command, source, ctx.env, run2) });
    } catch (error) {
      reports.push({ client, label: CLIENT_LABELS[client], command, source: describeSource(source), error: error.message });
    }
  }
  const updateAvailable = reports.some((report) => typeof report.version === "string" && served && report.version !== served) || Boolean(installed?.version && served && installed.version !== served);
  return {
    data: { server, servedVersion: served, updateAvailable, agentVersion: AGENT_VERSION, localFolder: installed ? { dir, ...installed } : null, clients: reports, legacy },
    text: [
      `served by ${server}: ${served ?? "unknown"}${updateAvailable ? " (update available: darkmind-agent plugin update)" : ""}`,
      ...installed ? [`local marketplace folder: ${dir} \u2013 version ${installed.version ?? "unknown"} for ${installed.server ?? "unknown server"}`] : [],
      ...reports.map(
        (report) => report.command === null ? `${report.label}: not found (marketplace: ${report.source})` : report.error ? `${report.label}: ${report.error}` : `${report.label} (${report.command}): marketplace ${report.marketplace}${report.location && report.marketplace === "elsewhere" ? ` (registered: ${report.location}; expected ${report.source})` : ` (${report.source})`}, plugin ${report.plugin}${report.version ? ` ${report.version}` : ""}`
      ),
      ...legacy.skillFolders.map((item) => `legacy: skill folder ${item.folder}`),
      ...legacy.mcpEntries.map((item) => `legacy: MCP server "${item.name}" in ${item.file}`)
    ].join("\n")
  };
}

// src/commands/preview.ts
import { createHash as createHash4 } from "node:crypto";
import { createReadStream as createReadStream3, promises as fs31, watch } from "node:fs";
import http2 from "node:http";
import path31 from "node:path";
import { pipeline as pipeline2 } from "node:stream/promises";

// src/pipeline/preview-page.ts
var PREVIEW_HTML = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dark Mind preview</title>
<style>
  :root { color-scheme: dark; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  body { margin: 0; background: #111; color: #eee; display: flex; flex-direction: column; height: 100vh; }
  header { padding: 8px 12px; display: flex; gap: 12px; align-items: baseline; border-bottom: 1px solid #333; }
  header h1 { font-size: 16px; margin: 0; font-weight: 600; }
  header .muted { color: #aaa; font-size: 12px; }
  main { flex: 1; display: flex; min-height: 0; }
  #stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-width: 0; min-height: 0; padding: 8px; }
  #stage canvas#view { flex: 1 1 0; min-height: 0; width: 100%; max-width: 100%; max-height: 100%; object-fit: contain; background: transparent; box-shadow: none; }
  canvas#view { background: #000; max-width: 100%; max-height: 100%; box-shadow: 0 0 0 1px #333; }
  .banner { align-self: stretch; max-height: 45%; overflow: auto; border: 1px solid #8a6a2a; background: #241d10; border-radius: 4px; padding: 8px 10px; font-size: 13px; }
  .banner h2 { margin: 0 0 4px; font-size: 14px; color: #f0d090; }
  .banner ol { margin: 4px 0 0; padding-left: 20px; }
  .banner li { margin: 3px 0; }
  .banner code { display: inline-block; margin: 1px 0; }
  aside { width: 340px; border-left: 1px solid #333; padding: 10px; overflow: auto; font-size: 13px; }
  aside h2 { font-size: 13px; margin: 12px 0 6px; color: #ccc; }
  .controls { padding: 8px 12px; border-top: 1px solid #333; display: flex; flex-direction: column; gap: 6px; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  button { background: #2a2a2a; color: #eee; border: 1px solid #444; border-radius: 4px; padding: 4px 10px; font: inherit; cursor: pointer; }
  button:hover, button:focus-visible { border-color: #888; outline: none; }
  button[aria-pressed="true"] { background: #444; }
  #tc { font-family: ui-monospace, Consolas, monospace; font-size: 15px; min-width: 260px; }
  canvas#bar { width: 100%; height: 70px; cursor: pointer; background: #1a1a1a; }
  code { background: #222; padding: 1px 4px; border-radius: 3px; user-select: all; }
  .issue { margin: 4px 0; padding: 4px 6px; border: 1px solid #5a4a2a; border-radius: 4px; background: #1d1912; }
  .issue.error { border-color: #6a2a2a; background: #231313; }
  ul { margin: 0; padding-left: 18px; }
  .note { color: #aaa; font-size: 12px; }
</style>
</head>
<body>
<header><h1 id="title">Dark Mind preview</h1><span class="muted" id="status">loading…</span></header>
<main>
  <div id="stage"><div id="missing" class="banner" role="status" hidden></div><canvas id="view" width="1080" height="1920" aria-label="Preview picture"></canvas></div>
  <aside>
    <div id="issues"></div>
    <h2>Range</h2>
    <div id="range">No in/out points (keys I and O).</div>
    <h2>Active at playhead</h2>
    <ul id="active"></ul>
    <h2>Keys</h2>
    <div class="note">Space play/pause · ←/→ one frame · Shift+←/→ one second · Home/End · I/O set in/out · X clear · L loop</div>
    <p class="note">The preview approximates the render from the same plan (proxies, timeline.json, captions.json, rendered extension outputs). Reviews and approvals refer to rendered previews in renders/proxy/.</p>
  </aside>
</main>
<div class="controls">
  <canvas id="bar" height="70" aria-label="Timeline"></canvas>
  <div class="row">
    <button id="play" aria-label="Play">Play</button>
    <button id="back" aria-label="One frame back">◀ 1f</button>
    <button id="fwd" aria-label="One frame forward">1f ▶</button>
    <button id="in" aria-label="Set in point">In</button>
    <button id="out" aria-label="Set out point">Out</button>
    <button id="loop" aria-pressed="false" aria-label="Loop between in and out">Loop</button>
    <span id="tc">00:00:00:00</span>
  </div>
</div>
<script>
(function () {
  var view = document.getElementById('view');
  var g = view.getContext('2d');
  var bar = document.getElementById('bar');
  var state = null, plan = null, fps = 30, total = 0;
  var t = 0, playing = false, wall0 = 0, t0 = 0;
  var inPoint = null, outPoint = null, loop = false;
  var elements = {};
  var audioCtx = null;

  function pad(n, w) { n = String(n); while (n.length < (w || 2)) n = '0' + n; return n; }
  function timecode(frame) {
    var s = Math.floor(frame / fps);
    return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60) + ':' + pad(frame % fps);
  }
  function rational(text) { var p = String(text).split('/'); return p.length === 2 ? Number(p[0]) / Number(p[1]) : Number(text); }
  function frameNow() { return Math.min(total - 1, Math.max(0, Math.floor(t * fps + 1e-6))); }
  function esc(text) { return String(text).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function ensureAudio() {
    if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function element(clip, kind) {
    var file = plan.files[clip.file];
    if (!file.url) return null; // browser copy still converting (or failed)
    var key = kind + ':' + clip.id + ':' + file.url;
    var entry = elements[key];
    if (entry) return entry;
    var el = document.createElement(kind === 'video' ? 'video' : 'audio');
    el.src = file.url; el.preload = 'auto'; el.crossOrigin = 'anonymous';
    if (kind === 'video') { el.muted = true; el.playsInline = true; }
    el.addEventListener('seeked', draw);
    el.addEventListener('loadeddata', draw);
    entry = { el: el, kind: kind, gain: null, used: true };
    elements[key] = entry;
    return entry;
  }

  function setGain(entry, clip) {
    var linear = Math.pow(10, (clip.gainDb || 0) / 20);
    if (audioCtx && !entry.gain) {
      try { var src = audioCtx.createMediaElementSource(entry.el); entry.gain = audioCtx.createGain(); src.connect(entry.gain); entry.gain.connect(audioCtx.destination); } catch (e) { entry.gain = null; }
    }
    if (entry.gain) entry.gain.gain.value = linear; else entry.el.volume = Math.min(1, linear);
  }

  function activeClips(tracks, frame) {
    var out = [];
    tracks.forEach(function (track) { track.clips.forEach(function (clip) { if (frame >= clip.start && frame < clip.end) out.push({ track: track, clip: clip }); }); });
    return out;
  }

  function mediaTime(clip) { return rational(clip.inLocal) + (t - clip.start / fps); }

  // Elements of clips that start soon are loaded and parked at their in-point, so playback switches without a
  // black or silent gap while the browser loads and seeks.
  var PREROLL_SECONDS = 3;
  function preroll(frame) {
    ['video', 'audio'].forEach(function (kind) {
      (kind === 'video' ? plan.video : plan.audio).forEach(function (track) {
        track.clips.forEach(function (clip) {
          if (clip.start <= frame || clip.start - frame > PREROLL_SECONDS * fps) return;
          var entry = element(clip, kind);
          if (!entry || !entry.el.paused || entry.el.seeking) return;
          var want = rational(clip.inLocal);
          if (Math.abs(entry.el.currentTime - want) > 0.001) { try { entry.el.currentTime = want; } catch (e) {} }
        });
      });
    });
  }

  function sync(force) {
    if (!plan) return;
    var frame = frameNow();
    var used = {};
    ['video', 'audio'].forEach(function (kind) {
      activeClips(kind === 'video' ? plan.video : plan.audio, frame).forEach(function (a) {
        var entry = element(a.clip, kind);
        if (!entry) return;
        used[kind + ':' + a.clip.id + ':' + plan.files[a.clip.file].url] = true;
        if (kind === 'audio') setGain(entry, a.clip);
        var want = mediaTime(a.clip);
        if (force || Math.abs(entry.el.currentTime - want) > (playing ? 0.15 : 0.001)) { try { entry.el.currentTime = want; } catch (e) {} }
        if (playing && entry.el.paused) entry.el.play().catch(function () {});
        if (!playing && !entry.el.paused) entry.el.pause();
      });
    });
    Object.keys(elements).forEach(function (key) { if (!used[key] && !elements[key].el.paused) elements[key].el.pause(); });
    preroll(frame);
  }

  function drawCaption(frame) {
    var style = state.captionStyle;
    if (!style) return; // brand caption styles appear only through the overlay of their caption block
    plan.captions.forEach(function (c) {
      if (frame < c.start || frame >= c.end) return;
      var lines = c.text.split('\n');
      g.font = style.fontSize + 'px Arial, Helvetica, sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'top';
      var lineH = style.fontSize + style.lineSpacing;
      var h = lines.length * lineH - style.lineSpacing;
      var w = 0; lines.forEach(function (l) { w = Math.max(w, g.measureText(l).width); });
      var y = view.height - h - style.marginBottom;
      g.fillStyle = 'rgba(0,0,0,0.6)';
      g.fillRect((view.width - w) / 2 - style.boxBorder, y - style.boxBorder, w + 2 * style.boxBorder, h + 2 * style.boxBorder);
      g.fillStyle = '#fff';
      lines.forEach(function (l, i) { g.fillText(l, view.width / 2, y + i * lineH); });
    });
  }

  // Stand-in for a timeline element the preview cannot show (not rendered here, or its browser copy is converting).
  function placeholder(label, overlay) {
    var fontSize = Math.round(view.width / 24);
    g.save();
    if (!overlay) {
      g.fillStyle = '#1b1b1b'; g.fillRect(0, 0, view.width, view.height);
      g.strokeStyle = '#2c2c2c'; g.lineWidth = Math.max(4, view.width / 120);
      for (var x = -view.height; x < view.width; x += view.width / 8) { g.beginPath(); g.moveTo(x, view.height); g.lineTo(x + view.height, 0); g.stroke(); }
    }
    g.font = '600 ' + fontSize + 'px system-ui, "Segoe UI", sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    var w = Math.min(view.width * 0.92, g.measureText(label).width + fontSize * 1.5), h = fontSize * 2;
    var y = overlay ? view.height * 0.72 : view.height / 2;
    g.fillStyle = 'rgba(80,55,10,0.92)'; g.fillRect((view.width - w) / 2, y - h / 2, w, h);
    g.strokeStyle = '#f0d090'; g.lineWidth = 3; g.setLineDash([12, 8]); g.strokeRect((view.width - w) / 2, y - h / 2, w, h);
    g.fillStyle = '#f0d090'; g.fillText(label, view.width / 2, y, view.width * 0.88);
    g.restore();
  }

  function activeMissing(frame) {
    return (state.missingClips || []).filter(function (m) { return frame >= m.start && frame < m.end; });
  }

  function draw() {
    if (!plan) return;
    var frame = frameNow();
    g.fillStyle = '#000'; g.fillRect(0, 0, view.width, view.height);
    activeClips(plan.video, frame).forEach(function (a) {
      var entry = element(a.clip, 'video');
      if (!entry) { placeholder((a.clip.extensionId || a.clip.id) + ': converting for the browser…', a.track.role === 'overlay'); return; }
      var el = entry.el;
      if (el.readyState < 2 || !el.videoWidth) return;
      var c = a.clip.crop;
      var kx = el.videoWidth / c.scaledWidth, ky = el.videoHeight / c.scaledHeight;
      g.drawImage(el, c.offsetX * kx, c.offsetY * ky, view.width * kx, view.height * ky, 0, 0, view.width, view.height);
    });
    activeMissing(frame).forEach(function (m) { if (m.kind === 'video') placeholder(m.extensionId + ' – not rendered in this folder', m.trackRole === 'overlay'); });
    drawCaption(frame);
    document.getElementById('tc').textContent = timecode(frame) + ' · frame ' + frame + ' / ' + total;
    var list = activeClips(plan.video, frame).concat(activeClips(plan.audio, frame)).map(function (a) {
      var file = plan.files[a.clip.file];
      return '<li>' + esc(a.track.id + ' ' + a.clip.id) + (a.clip.statementId ? ' (' + esc(a.clip.statementId) + ')' : '') + ' – ' + esc(file.path) + (file.browser === 'copy' ? ' (browser copy)' : file.browser === 'converting' ? ' (converting for the browser)' : file.browser === 'failed' ? ' (cannot be shown in the browser)' : '') + '</li>';
    });
    activeMissing(frame).forEach(function (m) { list.push('<li><strong>' + esc(m.trackId + ' ' + m.id) + ' – ' + esc(m.extensionId) + ' not rendered</strong></li>'); });
    plan.captions.forEach(function (c) { if (frame >= c.start && frame < c.end) list.push('<li>caption ' + esc(c.id) + (state.captions && state.captions.drawnBy === 'overlay' ? ' (' + esc(state.captions.style) + ', drawn by its overlay)' : '') + ': ' + esc(c.text) + '</li>'); });
    document.getElementById('active').innerHTML = list.join('') || '<li>gap</li>';
    drawBar(frame);
  }

  function drawBar(frame) {
    var w = bar.clientWidth, h = bar.height;
    if (bar.width !== w) bar.width = w;
    var b = bar.getContext('2d');
    b.fillStyle = '#1a1a1a'; b.fillRect(0, 0, w, h);
    var missing = state.missingClips || [];
    var rows = plan.video.length + plan.audio.length + 1 + (missing.length ? 1 : 0), rowH = h / rows, x = function (f) { return f / total * w; };
    if (inPoint !== null || outPoint !== null) { b.fillStyle = 'rgba(80,140,255,0.25)'; b.fillRect(x(inPoint || 0), 0, x(outPoint === null ? total : outPoint) - x(inPoint || 0), h); }
    var row = 0;
    plan.video.slice().reverse().forEach(function (track) { track.clips.forEach(function (c) { b.fillStyle = '#4a6fa5'; b.fillRect(x(c.start), row * rowH + 1, Math.max(1, x(c.end) - x(c.start) - 1), rowH - 2); }); row++; });
    plan.audio.forEach(function (track) { track.clips.forEach(function (c) { b.fillStyle = '#4a915a'; b.fillRect(x(c.start), row * rowH + 1, Math.max(1, x(c.end) - x(c.start) - 1), rowH - 2); }); row++; });
    plan.captions.forEach(function (c) { b.fillStyle = '#b0903a'; b.fillRect(x(c.start), row * rowH + 1, Math.max(1, x(c.end) - x(c.start) - 1), rowH - 2); });
    if (missing.length) { row++; missing.forEach(function (c) { b.fillStyle = '#a04040'; b.fillRect(x(c.start), row * rowH + 1, Math.max(1, x(c.end) - x(c.start) - 1), rowH - 2); }); }
    b.fillStyle = '#fff'; b.fillRect(x(frame), 0, 2, h);
  }

  function seek(frame) {
    frame = Math.max(0, Math.min(total - 1, frame));
    t = frame / fps; t0 = t; wall0 = performance.now();
    sync(true); draw();
  }

  function tick() {
    if (playing) {
      t = t0 + (performance.now() - wall0) / 1000;
      var end = (loop && outPoint !== null ? outPoint : total) / fps;
      if (t >= end) {
        if (loop) { t = (inPoint || 0) / fps; t0 = t; wall0 = performance.now(); sync(true); }
        else { t = Math.max(0, end - 1 / fps); setPlaying(false); }
      }
      sync(false); draw();
    }
    requestAnimationFrame(tick);
  }

  function setPlaying(value) {
    playing = value;
    if (value) { ensureAudio(); t0 = t; wall0 = performance.now(); }
    document.getElementById('play').textContent = value ? 'Pause' : 'Play';
    sync(true); draw();
  }

  function showRange() {
    var el = document.getElementById('range');
    if (inPoint === null && outPoint === null) { el.textContent = 'No in/out points (keys I and O).'; return; }
    var a = inPoint || 0, b = outPoint === null ? total : outPoint;
    el.innerHTML = 'In ' + a + ' (' + timecode(a) + ') – Out ' + b + ' (' + timecode(b) + '), ' + (b - a) + ' frames<br>Section render: <code>darkmind-agent render --proxy --section ' + a + '-' + b + '</code>';
    drawBar(frameNow());
  }

  function showIssues() {
    var items = (state.issues || []).map(function (i) { return '<div class="issue ' + esc(i.severity) + '">' + esc(i.severity + ' ' + i.code + (i.ref ? ' (' + i.ref + ')' : '') + ': ' + i.message) + '</div>'; });
    (state.needs || []).forEach(function (n) { items.push('<div class="issue error">needs: ' + esc(n.hint) + '</div>'); });
    document.getElementById('issues').innerHTML = items.join('');
    showMissing();
  }

  // What the picture lacks compared with the render, and the exact steps that bring it in (after a pull nothing of the
  // extension outputs exists: brand blocks and brand captions are rendered locally).
  function showMissing() {
    var box = document.getElementById('missing');
    var readiness = state.readiness || { elements: [], steps: [] };
    var converting = state.plan ? state.plan.files.filter(function (f) { return f.browser === 'converting'; }) : [];
    var html = [];
    if (readiness.elements.length) {
      var missing = readiness.elements.filter(function (e) { return e.status === 'missing'; });
      var outdated = readiness.elements.filter(function (e) { return e.status === 'outdated'; });
      var name = function (e) { return '<code>' + esc(e.id) + '</code>' + (e.captions ? ' (brand captions)' : ''); };
      if (missing.length) html.push('<h2>' + missing.length + ' timeline element' + (missing.length === 1 ? ' is' : 's are') + ' not rendered in this folder – the picture lacks them</h2><div>' + missing.map(name).join(', ') + '</div>');
      if (outdated.length) html.push('<h2>' + outdated.length + ' element' + (outdated.length === 1 ? ' is' : 's are') + ' outdated (shown from an earlier state)</h2><div>' + outdated.map(name).join(', ') + '</div>');
      html.push('<div class="note">Brand blocks, brand captions and other extensions are rendered locally; a pull does not bring them along. Steps in this order (the preview reloads by itself):</div><ol>' + readiness.steps.map(function (s) {
        return '<li><strong>' + esc(s.kind) + '</strong>' + (s.ids.length ? ' (' + esc(s.ids.join(', ')) + ')' : '') + ': ' + esc(s.note) + s.commands.map(function (c) { return '<br><code>' + esc(c) + '</code>'; }).join('') + '</li>';
      }).join('') + '</ol>');
    }
    if (converting.length) html.push('<div>Converting for the browser (preview only): ' + converting.map(function (f) { return '<code>' + esc(f.path) + '</code>'; }).join(', ') + ' …</div>');
    box.innerHTML = html.join('');
    box.hidden = html.length === 0;
    box.style.maxHeight = state.plan ? '' : 'none';
  }

  function load() {
    return fetch('/api/state', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (next) {
      state = next;
      showIssues();
      document.getElementById('status').textContent = (next.ok ? 'proxy plan' : 'not previewable') + ' · ' + new Date().toLocaleTimeString() + (next.validation && !next.validation.ready ? ' · draft (pending points)' : '');
      if (next.title) document.getElementById('title').textContent = next.title;
      if (!next.plan) { plan = null; return; }
      plan = next.plan;
      fps = rational(plan.output.fps); total = plan.totalFrames;
      view.width = plan.output.width; view.height = plan.output.height;
      var keep = {};
      plan.video.forEach(function (tr) { tr.clips.forEach(function (c) { keep['video:' + c.id + ':' + plan.files[c.file].url] = true; }); });
      plan.audio.forEach(function (tr) { tr.clips.forEach(function (c) { keep['audio:' + c.id + ':' + plan.files[c.file].url] = true; }); });
      Object.keys(elements).forEach(function (k) { if (!keep[k]) { elements[k].el.pause(); elements[k].el.removeAttribute('src'); delete elements[k]; } });
      plan.video.forEach(function (tr) { tr.clips.forEach(function (c) { element(c, 'video'); }); });
      plan.audio.forEach(function (tr) { tr.clips.forEach(function (c) { element(c, 'audio'); }); });
      if (inPoint !== null && inPoint >= total) inPoint = null;
      if (outPoint !== null && outPoint > total) outPoint = null;
      seek(Math.min(frameNow(), total - 1)); showRange();
    });
  }

  document.getElementById('play').onclick = function () { setPlaying(!playing); };
  document.getElementById('back').onclick = function () { setPlaying(false); seek(frameNow() - 1); };
  document.getElementById('fwd').onclick = function () { setPlaying(false); seek(frameNow() + 1); };
  document.getElementById('in').onclick = function () { inPoint = frameNow(); if (outPoint !== null && outPoint <= inPoint) outPoint = null; showRange(); };
  document.getElementById('out').onclick = function () { outPoint = frameNow() + 1; if (inPoint !== null && inPoint >= outPoint) inPoint = null; showRange(); };
  document.getElementById('loop').onclick = function () { loop = !loop; this.setAttribute('aria-pressed', String(loop)); };
  bar.addEventListener('click', function (e) { if (!plan) return; var r = bar.getBoundingClientRect(); seek(Math.floor((e.clientX - r.left) / r.width * total)); });
  document.addEventListener('keydown', function (e) {
    if (!plan || e.target.tagName === 'INPUT') return;
    var step = e.shiftKey ? fps : 1;
    if (e.key === ' ') { e.preventDefault(); setPlaying(!playing); }
    else if (e.key === 'ArrowLeft') { setPlaying(false); seek(frameNow() - step); }
    else if (e.key === 'ArrowRight') { setPlaying(false); seek(frameNow() + step); }
    else if (e.key === 'Home') seek(inPoint || 0);
    else if (e.key === 'End') seek((outPoint === null ? total : outPoint) - 1);
    else if (e.key === 'i' || e.key === 'I') document.getElementById('in').onclick();
    else if (e.key === 'o' || e.key === 'O') document.getElementById('out').onclick();
    else if (e.key === 'x' || e.key === 'X') { inPoint = null; outPoint = null; showRange(); }
    else if (e.key === 'l' || e.key === 'L') document.getElementById('loop').onclick.call(document.getElementById('loop'));
  });
  window.addEventListener('resize', function () { if (plan) drawBar(frameNow()); });
  var events = new EventSource('/events');
  events.addEventListener('change', function () { load(); });
  load().then(function () { requestAnimationFrame(tick); });
})();
</script>
</body>
</html>
`;

// src/commands/preview.ts
var BROWSER_COPY_VERSION = 1;
var DEFAULT_PREVIEW_PORT = 4610;
var CONTENT_TYPES = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".aac": "audio/aac"
};
var IGNORED = /^(renders[\\/](\.cache|\.tmp|proxy|final|sections)|\.darkmind|\.git|node_modules)([\\/]|$)/i;
async function startPreviewServer(options) {
  const root = options.root;
  const tools = options.tools ?? defaultTools();
  const env = options.env ?? process.env;
  const log = options.log ?? (() => {
  });
  let media = /* @__PURE__ */ new Map();
  let state = null;
  let revision = 0;
  const clients = /* @__PURE__ */ new Set();
  const copies = /* @__PURE__ */ new Map();
  let queue = Promise.resolve();
  const browserCopy = async (file, input) => {
    const key = createHash4("sha256").update(`${BROWSER_COPY_VERSION}|${file.path}|${file.size}|${file.mtimeMs}`).digest("hex").slice(0, 32);
    const known = copies.get(key);
    if (known) return known;
    const target = path31.join(root, "renders", ".cache", "preview", `${key}.webm`);
    const ready = (await fs31.stat(target).catch(() => null))?.isFile();
    const entry = { status: ready ? "ready" : "converting", file: target };
    copies.set(key, entry);
    if (ready) return entry;
    queue = queue.then(async () => {
      const temp = `${target}.${process.pid}.tmp`;
      try {
        await fs31.mkdir(path31.dirname(target), { recursive: true });
        log(`converting ${file.path} for the browser (${file.video?.codec ?? "audio"}${file.video?.alpha ? " with alpha" : ""} \u2192 VP9/WebM, preview only)`);
        const result = await tools.run(tools.ffmpeg, browserCopyArgs(input, temp, file), { timeoutMs: 30 * 6e4 });
        if (result.code !== 0) throw new Error(result.stderr.trim().split(/\r?\n/).slice(-3).join(" ") || `ffmpeg exited with ${result.code}`);
        await fs31.rename(temp, target);
        entry.status = "ready";
      } catch (error) {
        await fs31.rm(temp, { force: true }).catch(() => {
        });
        entry.status = "failed";
        entry.error = errorMessage(error);
        log(`warning: no browser copy of ${file.path}: ${entry.error}`);
      }
      notify();
    });
    return entry;
  };
  const readiness = async (docs, needs) => {
    if (!docs?.extensions.length) return { elements: [], steps: [] };
    const captionsFile = (docs.project.artifacts?.captions ?? EDIT_DEFAULT_FILES.captions).toLowerCase();
    const captionReaders = new Set(docs.extensions.filter((e) => e.inputs.some((i) => i.kind === "file" && i.path.toLowerCase() === captionsFile)).map((e) => e.id));
    try {
      const inspection = await inspectExtensions({ root, mode: "proxy", tools, env });
      return await previewReadiness(root, inspection.states, needs, captionReaders);
    } catch {
      return { elements: [], steps: [] };
    }
  };
  const buildState = async () => {
    const cache = await HashCache.load(mediaHashCachePath(root));
    const result = await buildExecutionPlan({ root, mode: "proxy", tools, hashes: { cache, computeOriginals: false }, allowMissingExtensionOutputs: true });
    const plan = result.plan;
    const docs = result.validation.documents;
    const issues = [...result.issues];
    const next = /* @__PURE__ */ new Map();
    const files = [];
    for (const file of plan?.files ?? []) {
      const input = path31.join(root, ...file.path.split("/"));
      let served = input;
      let browser = "direct";
      if (!browserPlayable(file)) {
        if (file.role === "extension" || file.role === "asset") {
          const copy = await browserCopy(file, input);
          browser = copy.status === "ready" ? "copy" : copy.status;
          if (copy.status === "ready") served = copy.file;
          if (copy.status === "failed") issues.push({ severity: "warning", code: "preview-copy-failed", message: `${file.path} (${file.video?.codec}) cannot be shown in the browser: ${copy.error}`, ...file.extensionId ? { ref: file.extensionId } : {} });
        } else {
          browser = "unsupported";
          issues.push({ severity: "warning", code: "preview-codec", message: `the browser cannot decode ${file.path} (${file.video?.codec}); load a proxy of this video (darkmind-agent plan lists it)`, ...file.sourceId ? { ref: file.sourceId } : {} });
        }
      }
      const available = browser === "direct" || browser === "copy" || browser === "unsupported";
      if (available) next.set(file.id, served);
      files.push({ ...file, browser, url: available ? `/media/${file.id}?r=${revision}-${file.mtimeMs}${browser === "copy" ? "-webm" : ""}` : null });
    }
    media = next;
    const planned = new Set([...plan?.video ?? [], ...plan?.audio ?? []].flatMap((t) => t.clips.map((c) => c.id)));
    const missingClips = [];
    if (docs?.timeline) {
      const fps = parseRational(docs.project.output.fps);
      for (const kind of ["video", "audio"]) {
        for (const track of docs.timeline[kind]) {
          for (const clip of track.clips) {
            if (!clip.extensionId || planned.has(clip.id)) continue;
            const frames = Number(rangeFrames(parseRational(clip.in), parseRational(clip.out), fps));
            missingClips.push({ id: clip.id, extensionId: clip.extensionId, trackId: track.id, trackRole: track.role, kind, start: clip.start, end: clip.start + frames });
          }
        }
      }
    }
    const brandCaptions = Boolean(plan && plan.captionStyle !== "plain");
    return {
      ok: Boolean(plan),
      revision,
      agentVersion: AGENT_VERSION,
      title: docs?.project.title ?? null,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      validation: { valid: result.validation.valid, ready: result.validation.ready, counts: result.validation.counts },
      issues: [
        ...issues,
        ...result.validation.issues.filter((i) => i.severity === "error").map((i) => ({ severity: "error", code: i.code, message: `${i.file} ${i.path}: ${i.message}`, ref: i.ref }))
      ],
      needs: result.needs,
      // brand caption styles appear only through the overlay of their caption block (the render burns nothing in)
      captionStyle: plan && !brandCaptions ? plainCaptionStyle(plan.output.width, plan.output.height) : null,
      captions: plan ? { style: plan.captionStyle, drawnBy: brandCaptions ? "overlay" : "preview" } : null,
      missingClips,
      readiness: await readiness(docs ?? null, result.needs),
      plan: plan ? { ...plan, files } : null
    };
  };
  const notify = () => {
    revision++;
    state = null;
    for (const client of clients) client.write(`event: change
data: ${revision}

`);
  };
  const currentState = () => state ??= buildState().catch((error) => ({ ok: false, issues: [{ severity: "error", code: "preview-failed", message: errorMessage(error) }], plan: null }));
  const server = http2.createServer(async (request, response) => {
    const address2 = server.address();
    const host = request.headers.host ?? "";
    if (host !== `127.0.0.1:${address2.port}` && host !== `localhost:${address2.port}`) {
      response.writeHead(403).end("forbidden");
      return;
    }
    const url = new URL(request.url ?? "/", `http://${host}`);
    try {
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405).end();
        return;
      }
      if (url.pathname === "/") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }).end(PREVIEW_HTML);
        return;
      }
      if (url.pathname === "/api/state") {
        const body = JSON.stringify(await currentState());
        response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }).end(body);
        return;
      }
      if (url.pathname === "/events") {
        response.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
        response.write(`event: hello
data: ${revision}

`);
        clients.add(response);
        request.on("close", () => clients.delete(response));
        return;
      }
      const match = /^\/media\/(\d+)$/.exec(url.pathname);
      if (match) {
        const file = media.get(Number(match[1]));
        if (!file) {
          response.writeHead(404).end();
          return;
        }
        await sendFile(request, response, file);
        return;
      }
      response.writeHead(404).end();
    } catch (error) {
      if (!response.headersSent) response.writeHead(500, { "Content-Type": "text/plain" });
      response.end(errorMessage(error));
    }
  });
  const port = options.port ?? DEFAULT_PREVIEW_PORT;
  await new Promise((resolve, reject) => {
    const onError = (error) => {
      if (error.code === "EADDRINUSE" && options.port === void 0) {
        server.off("error", onError);
        server.listen(0, "127.0.0.1", () => resolve());
      } else reject(error);
    };
    server.once("error", onError);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", onError);
      resolve();
    });
  }).catch((error) => {
    throw new CliError("port-in-use", `cannot listen on 127.0.0.1:${port}: ${error.message}`);
  });
  let watcher = null;
  let timer = null;
  if (options.watch !== false) {
    try {
      watcher = watch(root, { recursive: true }, (_event, name) => {
        const rel3 = name ? String(name) : "";
        if (rel3 && IGNORED.test(rel3)) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          log(`changed: ${rel3 || "project"} \u2013 reloading the preview`);
          notify();
        }, 300);
      });
    } catch (error) {
      log(`warning: file watching is not available (${errorMessage(error)}); reload the page after changes`);
    }
  }
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}/`,
    notify,
    state: currentState,
    close: async () => {
      if (timer) clearTimeout(timer);
      watcher?.close();
      for (const client of clients) client.end();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(() => resolve()));
    }
  };
}
async function sendFile(request, response, file) {
  const stat = await fs31.stat(file);
  const type = CONTENT_TYPES[path31.extname(file).toLowerCase()] ?? "application/octet-stream";
  const range2 = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range ?? "");
  let start = 0;
  let end = stat.size - 1;
  if (range2 && (range2[1] || range2[2])) {
    if (range2[1]) {
      start = Number(range2[1]);
      if (range2[2]) end = Math.min(Number(range2[2]), end);
    } else {
      start = Math.max(0, stat.size - Number(range2[2]));
    }
    if (start > end || start >= stat.size) {
      response.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end();
      return;
    }
    response.writeHead(206, { "Content-Type": type, "Content-Length": end - start + 1, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" });
  } else {
    response.writeHead(200, { "Content-Type": type, "Content-Length": stat.size, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" });
  }
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  pipeline2(createReadStream3(file, { start, end }), response).catch(() => {
  });
}
async function previewCommand(ctx, options, tools = defaultTools(ctx.env)) {
  const log = options.log ?? (() => {
  });
  const server = await startPreviewServer({ root: ctx.root, tools, env: ctx.env, port: options.port, log });
  log(`Dark Mind preview: ${server.url} (proxy state of ${ctx.root}; Ctrl+C to stop)`);
  const first = await server.state().catch(() => null);
  const readiness = first?.readiness;
  if (readiness?.elements.length) {
    log(
      `not in the preview yet (not rendered in this folder): ${readiness.elements.map((e) => `${e.id}${e.status === "outdated" ? " (outdated)" : ""}${e.captions ? " (captions)" : ""}`).join(", ")}`
    );
    for (const step of readiness.steps) log(`  ${step.kind}: ${[...step.commands, step.note].join(" \xB7 ")}`);
  }
  await new Promise((resolve) => {
    if (options.signal?.aborted) resolve();
    options.signal?.addEventListener("abort", () => resolve(), { once: true });
  });
  await server.close();
  return { data: { url: server.url, stopped: true }, text: `preview stopped (${server.url})` };
}

// src/commands/recipe.ts
import { promises as fs32 } from "node:fs";
import path32 from "node:path";
import { pathToFileURL } from "node:url";
async function brandPackDir(env, scriptPath = process.argv[1]) {
  const explicit = env.DARKMIND_BRAND_PACK?.trim();
  if (explicit) return path32.resolve(explicit);
  const skill = await detectSkill(scriptPath);
  return skill ? path32.join(skill.folder, "brand") : null;
}
async function loadBrandPackModules(env, scriptPath) {
  const dir = await brandPackDir(env, scriptPath);
  if (!dir || !await fs32.stat(path32.join(dir, "brand.json")).catch(() => null)) {
    throw new CliError("brand-pack-missing", "no brand pack: run darkmind-agent from the editing skill (the Dark Mind plugin) or set DARKMIND_BRAND_PACK to its brand/ folder");
  }
  const load = async (rel3) => {
    try {
      return await import(pathToFileURL(path32.join(dir, ...rel3.split("/"))).href);
    } catch (error) {
      throw new CliError("brand-pack-invalid", `brand pack ${dir}: ${rel3} cannot be loaded (${errorMessage(error)}); install the editing skill again`);
    }
  };
  const catalogModule = await load("lib/catalog.mjs");
  if (typeof catalogModule.loadRecipeCatalog !== "function") throw new CliError("brand-pack-invalid", `brand pack ${dir} has no recipe catalog (older than 0.7.0): update the editing skill`);
  return {
    dir,
    brand: await catalogModule.loadBrand(dir),
    catalog: await catalogModule.loadRecipeCatalog(dir),
    recipes: await load("lib/recipes.mjs"),
    projectDocs: await load("lib/project-docs.mjs")
  };
}
var json = (value2) => `${JSON.stringify(value2, null, 2)}
`;
var recipeSha256 = (recipe) => sha256Hex(Buffer.from(canonicalRecipeJson(recipe), "utf8"));
var formatIssue = (issue) => `${issue.path || "(recipe)"}: ${issue.message} [${issue.code}]`;
async function readRecipeFile(file) {
  let text3;
  try {
    text3 = await fs32.readFile(file, "utf8");
  } catch (error) {
    throw new CliError("recipe-missing", `${file} cannot be read (${error.code === "ENOENT" ? "missing" : errorMessage(error)})`);
  }
  try {
    return JSON.parse(text3.replace(/^\uFEFF/, ""));
  } catch (error) {
    throw new CliError("recipe-invalid", `${file} is not valid JSON: ${errorMessage(error)}`);
  }
}
async function readRecipeLock(root) {
  const file = path32.join(root, EDIT_RECIPE_FILES.lock);
  const raw = await readJsonFile(file).catch((error) => {
    throw new CliError("recipe-lock-invalid", `${EDIT_RECIPE_FILES.lock} is not valid JSON: ${errorMessage(error)}`);
  });
  if (raw === null) return null;
  const parsed = editRecipeLockSchema.safeParse(raw);
  if (!parsed.success) throw new CliError("recipe-lock-invalid", `${EDIT_RECIPE_FILES.lock}: ${parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  const lock = parsed.data;
  if (recipeSha256(lock.recipe) !== lock.sha256) {
    throw new CliError("recipe-lock-modified", `${EDIT_RECIPE_FILES.lock} was changed by hand (its recipe no longer has SHA-256 ${lock.sha256.slice(0, 12)}\u2026); apply the recipe again (recipe try for a draft)`);
  }
  return lock;
}
async function validate(ctx, file) {
  const pack = await loadBrandPackModules(ctx.env);
  const target = path32.resolve(ctx.root, file ?? EDIT_RECIPE_FILES.draft);
  const result = validateRecipe(await readRecipeFile(target), pack.catalog);
  const todo = result.recipe ? [...canonicalRecipeJson(result.recipe).matchAll(/"TODO: /g)].length : 0;
  return {
    data: {
      file: path32.relative(ctx.root, target).split(path32.sep).join("/") || target,
      valid: result.valid,
      recipe: result.recipe ? { id: result.recipe.meta.id, title: result.recipe.meta.title } : null,
      brandPack: pack.catalog.brand,
      issues: result.issues,
      todo,
      sha256: result.recipe ? recipeSha256(result.recipe) : null
    },
    text: [
      result.valid ? `valid recipe ${result.recipe.meta.id} for brand pack ${pack.catalog.brand.version}${todo ? ` \u2013 ${todo} TODO text(s) left` : ""}` : `INVALID recipe (${result.issues.length} issues):`,
      ...result.issues.slice(0, 50).map((i) => `  ${formatIssue(i)}`)
    ].join("\n"),
    exitCode: result.valid ? 0 : 1
  };
}
async function show(ctx, file) {
  const pack = await loadBrandPackModules(ctx.env).catch(() => null);
  let recipe;
  let meta;
  let origin;
  if (file) {
    const result = validateRecipe(await readRecipeFile(path32.resolve(ctx.root, file)), null);
    if (!result.recipe) throw new CliError("recipe-invalid", `${file}: ${result.issues.slice(0, 5).map(formatIssue).join("; ")}`);
    recipe = result.recipe;
    meta = { version: null, sha256: recipeSha256(recipe), source: "draft", publishedAt: null };
    origin = file;
  } else {
    const lock = await readRecipeLock(ctx.root);
    if (!lock) throw new CliError("recipe-lock-missing", `no ${EDIT_RECIPE_FILES.lock} in this folder: name a recipe file (darkmind-agent recipe show ${EDIT_RECIPE_FILES.draft})`);
    recipe = lock.recipe;
    meta = { version: lock.version, sha256: lock.sha256, source: lock.source, publishedAt: lock.publishedAt };
    origin = EDIT_RECIPE_FILES.lock;
  }
  const markdown = renderRecipeMarkdown(recipe, meta, pack?.catalog ?? null);
  return { data: { file: origin, ...meta, recipe, markdown }, text: markdown.trimEnd() };
}
async function timelineClipCount(root, project) {
  const artifacts = project.artifacts ?? {};
  const timeline = await readJsonFile(path32.join(root, ...(artifacts.timeline ?? "timeline.json").split("/"))).catch(() => null);
  return [...timeline?.video ?? [], ...timeline?.audio ?? []].reduce((n, t) => n + (t.clips?.length ?? 0), 0);
}
async function applyRecipeToProject(ctx, pack, recipe, lock, options = {}) {
  const projectFile = path32.join(ctx.root, "project.json");
  const project = await readJsonFile(projectFile);
  if (!project) throw new CliError("project-missing", "no project.json in this folder: start the project first (darkmind-agent init, then write project.json \u2013 see SKILL.md)");
  const issues = validateRecipe(recipe, pack.catalog).issues;
  if (issues.length) throw new CliError("recipe-invalid", `the recipe does not fit brand pack ${pack.catalog.brand.version}: ${issues.slice(0, 5).map(formatIssue).join("; ")}`, { issues });
  const sha2563 = recipeSha256(recipe);
  const reference = { id: recipe.meta.id, version: lock.version, sha256: sha2563, source: lock.source };
  const fields = pack.recipes.recipeProjectFields(pack.brand, recipe, reference);
  const changedProfile = JSON.stringify(project.output) !== JSON.stringify(fields.output);
  const clips = changedProfile ? await timelineClipCount(ctx.root, project) : 0;
  if (changedProfile && clips && !options.force) {
    const out = fields.output;
    const current = project.output;
    throw new CliError(
      "recipe-profile-change",
      `${recipe.meta.id} renders ${out.width} \xD7 ${out.height} at ${out.fps}; the timeline already has ${clips} clips for ${current?.width} \xD7 ${current?.height} at ${current?.fps} (crops and frames would change) \u2013 start a new project, or pass --force and rebuild the timeline`
    );
  }
  const existing = await readRecipeLock(ctx.root).catch(() => null);
  if (existing?.source === "catalog" && lock.source === "draft" && !options.force) {
    throw new CliError("recipe-lock-catalog", `the project uses ${existing.slug} version ${existing.version} of the catalog; replacing it with a local draft needs --force (only in a test project)`);
  }
  const lockDocument = {
    schemaVersion: 1,
    kind: EDIT_RECIPE_LOCK_KIND,
    slug: recipe.meta.id,
    version: lock.version,
    sha256: sha2563,
    source: lock.source,
    publishedAt: lock.publishedAt,
    brandPack: { id: pack.catalog.brand.id, version: pack.catalog.brand.version },
    lockedAt: (/* @__PURE__ */ new Date()).toISOString(),
    recipe
  };
  await writeFileAtomic(path32.join(ctx.root, EDIT_RECIPE_FILES.lock), json(lockDocument));
  await writeFileAtomic(projectFile, json({ ...project, ...fields }));
  return { lock: lockDocument, projectJson: fields, changedProfile };
}
async function tryRecipe(ctx, file, options) {
  const pack = await loadBrandPackModules(ctx.env);
  const target = path32.resolve(ctx.root, file ?? EDIT_RECIPE_FILES.draft);
  const result = validateRecipe(await readRecipeFile(target), pack.catalog);
  if (!result.recipe || !result.valid) {
    throw new CliError("recipe-invalid", `${path32.basename(target)} is not a valid recipe: ${result.issues.slice(0, 5).map(formatIssue).join("; ")} (darkmind-agent recipe validate shows all)`, { issues: result.issues });
  }
  const applied = await applyRecipeToProject(ctx, pack, result.recipe, { version: null, source: "draft", publishedAt: null }, options);
  const required = Object.entries(result.recipe.structure.blocks).filter(([, spec]) => spec.use === "required").map(([block2]) => block2);
  return {
    data: {
      recipe: result.recipe.meta.id,
      source: "draft",
      sha256: applied.lock.sha256,
      lock: EDIT_RECIPE_FILES.lock,
      projectJson: applied.projectJson,
      next: [
        "darkmind-agent recipe show \u2013 the recipe as the agent follows it",
        `vendor the blocks with add-block (${required.join(", ")})`,
        "darkmind-agent recipe check after every change of the timeline; darkmind-agent validate as usual",
        "render the proxy and show it with the check result to the editor; change recipe.draft.json and run recipe try again"
      ]
    },
    text: `applied draft ${result.recipe.meta.id} (SHA-256 ${applied.lock.sha256.slice(0, 12)}\u2026) to this project: ${EDIT_RECIPE_FILES.lock} and project.json (output, duration, recipe, audioMaster)`
  };
}
async function lockedRecipe(ctx) {
  const pack = await loadBrandPackModules(ctx.env);
  const lock = await readRecipeLock(ctx.root);
  if (!lock) throw new CliError("recipe-lock-missing", `no ${EDIT_RECIPE_FILES.lock}: apply a recipe first (recipe try for a draft)`);
  const issues = [];
  if (!satisfiesVersionRange(pack.catalog.brand.version, lock.recipe.brand.versions)) {
    issues.push({ severity: "error", code: "recipe-brand-incompatible", message: `${lock.slug} needs brand pack ${lock.recipe.brand.versions}; this skill has ${pack.catalog.brand.version} \u2013 update the editing skill (plugin update) or apply a newer version of the recipe` });
  }
  for (const issue of validateRecipe(lock.recipe, pack.catalog).issues) {
    if (issue.code !== "recipe-brand-incompatible") issues.push({ severity: "error", code: issue.code, message: `${EDIT_RECIPE_FILES.lock} ${issue.path}: ${issue.message}` });
  }
  return { pack, lock, issues };
}
async function recipeReviewNotes(ctx) {
  const lock = await readRecipeLock(ctx.root).catch(() => null);
  if (!lock) return null;
  const pack = await loadBrandPackModules(ctx.env).catch(() => null);
  if (!pack) return null;
  const docs = await pack.projectDocs.loadProjectDocs(ctx.root, pack.dir).catch(() => null);
  if (!docs) return null;
  const result = pack.recipes.checkProject(pack.brand, lock.recipe, docs);
  return {
    recipe: { slug: lock.slug, version: lock.version, source: lock.source },
    deviations: result.issues.filter((i) => i.severity === "deviation"),
    hints: result.issues.filter((i) => i.severity === "hint"),
    material: result.material ?? [],
    editorial: result.editorial ?? null
  };
}
async function check(ctx, options) {
  const { pack, lock, issues: lockIssues } = await lockedRecipe(ctx);
  const docs = await pack.projectDocs.loadProjectDocs(ctx.root, pack.dir);
  const project = docs.project;
  if (project.recipe?.sha256 && project.recipe.sha256 !== lock.sha256) {
    lockIssues.push({ severity: "error", code: "recipe-lock-mismatch", message: `project.json names SHA-256 ${project.recipe.sha256.slice(0, 12)}\u2026, ${EDIT_RECIPE_FILES.lock} holds ${lock.sha256.slice(0, 12)}\u2026: apply the recipe again` });
  }
  if (options.done) {
    const status2 = await reviewCommand(ctx, "status", void 0, {});
    docs.reviews = status2.data;
  }
  const result = pack.recipes.checkProject(pack.brand, lock.recipe, docs);
  const issues = [...lockIssues, ...result.issues];
  const count2 = (severity) => issues.filter((i) => i.severity === severity).length;
  const valid = count2("error") === 0;
  const ready = valid && count2("pending") === 0;
  const counts = { error: count2("error"), deviation: count2("deviation"), pending: count2("pending"), warning: count2("warning"), hint: count2("hint") };
  const version = lock.version === null ? "draft" : `version ${lock.version}`;
  const lines = issues.slice(0, 80).map((i) => `  ${i.severity} ${i.code}: ${i.message}`);
  return {
    data: { ...result, recipe: { id: lock.slug, version: lock.version, source: lock.source, sha256: lock.sha256 }, brandPack: pack.catalog.brand, valid, ready, counts, issues },
    text: [
      `${valid ? ready ? "ok" : "valid, not ready" : "ERRORS"}: ${lock.slug} ${version} \u2013 ${counts.error} errors, ${counts.deviation} deviations from the recipe (report them, the editor may want them), ${counts.pending} pending, ${counts.warning} warnings, ${counts.hint} hints${result.done === null ? "" : result.done ? "; done" : "; not done"}`,
      ...lines
    ].join("\n"),
    exitCode: valid ? 0 : 1
  };
}
async function chapters(ctx, options) {
  const { pack, lock } = await lockedRecipe(ctx);
  if (!lock.recipe.technical.deliverables.chapters?.required) throw new CliError("recipe-no-chapters", `${lock.slug} has no YouTube chapter list`);
  const docs = await pack.projectDocs.loadProjectDocs(ctx.root, pack.dir);
  const result = pack.recipes.projectChapters(lock.recipe, docs);
  const failed = result.issues.some((i) => i.severity === "error");
  if (options.out && !failed) await writeFileAtomic(path32.resolve(ctx.root, options.out), `${result.text}
`);
  return {
    data: { recipe: lock.slug, source: docs.chapters ? "chapters.json" : lock.recipe.technical.deliverables.chapters.derive ? `derived from ${lock.recipe.technical.deliverables.chapters.derive}` : null, ...result, ...options.out && !failed ? { written: options.out } : {} },
    text: [result.text || "(no chapters)", ...result.issues.map((i) => `  ${i.severity} ${i.code}: ${i.message}`)].join("\n"),
    exitCode: failed ? 1 : 0
  };
}
async function derive(ctx, options) {
  const pack = await loadBrandPackModules(ctx.env);
  const docs = await pack.projectDocs.loadProjectDocs(ctx.root, pack.dir).catch((error) => {
    throw new CliError("project-missing", errorMessage(error));
  });
  const config = await readJsonFile(path32.join(ctx.root, "darkmind.json")).catch(() => null);
  const sourceProject = config?.projectId ? { projectId: config.projectId, version: config.baseVersion && config.baseVersion > 0 ? config.baseVersion : null } : null;
  const id2 = options.id ?? "new-format";
  const { recipe, todo, lengthSeconds } = pack.recipes.deriveRecipe(pack.brand, docs, { id: id2, sourceProject });
  const result = validateRecipe(recipe, pack.catalog);
  if (!result.valid) throw new CliError("recipe-derive-failed", `the derived skeleton is invalid: ${result.issues.slice(0, 5).map(formatIssue).join("; ")}`, { issues: result.issues });
  const out = path32.resolve(ctx.root, options.out ?? EDIT_RECIPE_FILES.draft);
  const rel3 = path32.relative(ctx.root, out).split(path32.sep).join("/");
  if (!options.print) {
    if (await fs32.stat(out).catch(() => null) && !options.force) throw new CliError("recipe-draft-exists", `${rel3} exists: pass --force to replace it, or --out <file>`);
    await writeFileAtomic(out, json(recipe));
  }
  return {
    data: { recipe, todo, lengthSeconds, ...options.print ? {} : { written: rel3 } },
    text: options.print ? json(recipe).trimEnd() : `wrote ${rel3}: skeleton of ${id2} from this project (${Math.round(lengthSeconds)} s); complete with the editor: ${todo.join(", ")} \u2013 generalise, nothing of this one episode belongs into the recipe`
  };
}
async function recipeCommand(ctx, action, args, options) {
  if (args.length > (action === "submit" ? 2 : 1)) throw new CliError("usage", `recipe ${action ?? ""}: too many arguments ("${args.join(" ")}")`);
  switch (action) {
    case "validate":
      return validate(ctx, args[0]);
    case "show":
      return show(ctx, args[0]);
    case "try":
      return tryRecipe(ctx, args[0], options);
    case "check":
      return check(ctx, options);
    case "chapters":
      return chapters(ctx, options);
    case "derive":
      return derive(ctx, options);
    case "use":
      return use(ctx, args[0], options);
    case "submit":
      return submit(ctx, args[0], args[1], options);
    case "status":
      return status(ctx);
    default:
      throw new CliError(
        "usage",
        "usage: darkmind-agent recipe validate [<file>] | show [<file>] | try [<file>] [--force] | check [--done] | chapters [--out <file>] | derive [--id <slug>] [--out <file>] [--force] [--print] | use <ticket> [--upgrade] [--draft] [--force] | submit <ticket> [<file>] | status"
      );
  }
}
async function postTransfer(ctx, endpoint, body, retry) {
  const server = resolveServer(ctx.server, await readConfig(ctx.root).catch(() => null), ctx.env);
  const send = async () => {
    const response = await httpRequest(`${server}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      timeoutMs: 6e4
    });
    if ((response.statusCode ?? 0) >= 400) throw await toHttpError(response, "Dark Mind refused the request");
    return JSON.parse((await readBody(response, 4 * 1024 * 1024)).toString("utf8"));
  };
  try {
    return { server, data: retry ? await withRetry(send, { attempts: 3 }) : await send() };
  } catch (error) {
    if (error instanceof HttpError) {
      const payload = error.body;
      throw new CliError(error.code ?? `http-${error.status}`, payload?.message ?? error.message, payload?.details ?? { status: error.status });
    }
    throw new CliError("network-error", `Cannot reach ${server}: ${errorMessage(error)}`);
  }
}
async function use(ctx, ticket, options) {
  const value2 = checkTicket(ticket);
  const pack = await loadBrandPackModules(ctx.env);
  const { data } = await postTransfer(ctx, "/api/agent-transfer/recipe", { ticket: value2 }, true);
  const result = validateRecipe(data.recipe, pack.catalog);
  if (!result.recipe) throw new CliError("recipe-invalid", `Dark Mind sent an unreadable recipe: ${result.issues.slice(0, 3).map(formatIssue).join("; ")}`);
  if (recipeSha256(result.recipe) !== data.sha256) throw new CliError("recipe-corrupt", `${data.slug} version ${data.version} does not match its SHA-256; fetch it again (recipe_get)`);
  if (!result.valid) {
    throw new CliError("recipe-invalid", `${data.slug} version ${data.version} does not fit brand pack ${pack.catalog.brand.version} of this skill: ${result.issues.slice(0, 5).map(formatIssue).join("; ")} (update the skill: darkmind-agent plugin update)`, { issues: result.issues });
  }
  const recipe = result.recipe;
  if (options.draft) {
    const file = path32.join(ctx.root, EDIT_RECIPE_FILES.draft);
    if (await fs32.stat(file).catch(() => null) && !options.force) throw new CliError("recipe-draft-exists", `${EDIT_RECIPE_FILES.draft} exists: pass --force to replace it with ${data.slug} version ${data.version}`);
    await writeFileAtomic(file, json(recipe));
    return {
      data: { recipe: data.slug, version: data.version, written: EDIT_RECIPE_FILES.draft, basedOnVersion: data.version },
      text: `wrote ${EDIT_RECIPE_FILES.draft} from ${data.slug} version ${data.version}: change it with the editor, then recipe validate / try; publish with recipe_publish_begin(slug "${data.slug}", basedOnVersion ${data.version}, changeNote)`
    };
  }
  const existing = await readRecipeLock(ctx.root).catch(() => null);
  let changes = [];
  if (existing?.source === "catalog") {
    if (existing.slug !== data.slug && !options.force) throw new CliError("recipe-lock-other", `the project uses ${existing.slug} version ${existing.version}; switching to ${data.slug} needs --force`);
    if (existing.slug === data.slug && existing.version === data.version && existing.sha256 === data.sha256) {
      return { data: { recipe: data.slug, version: data.version, status: "unchanged", sha256: data.sha256 }, text: `${data.slug} version ${data.version} is already the project's recipe` };
    }
    if (existing.slug === data.slug && !options.upgrade) {
      throw new CliError("recipe-upgrade-required", `the project is built with ${data.slug} version ${existing.version}; moving to version ${data.version} is an upgrade: ask the editor, then run recipe use <ticket> --upgrade (the preview and final reviews must be approved again)`);
    }
    if (existing.slug === data.slug) changes = classifyRecipeChange(existing.recipe, recipe);
  }
  const applied = await applyRecipeToProject(ctx, pack, recipe, { version: data.version, source: "catalog", publishedAt: data.publishedAt }, { force: options.force });
  const upgraded = existing?.source === "catalog" && existing.slug === data.slug;
  return {
    data: {
      recipe: data.slug,
      version: data.version,
      status: data.status,
      source: "catalog",
      sha256: applied.lock.sha256,
      lock: EDIT_RECIPE_FILES.lock,
      projectJson: applied.projectJson,
      ...upgraded ? { upgradedFrom: existing.version, changes, reviews: "the recipe reference changed: the preview and final reviews must be approved again; the editorial review stays" } : {},
      next: ["darkmind-agent recipe show \u2013 read the whole recipe, ask its briefing questions", "darkmind-agent recipe check after every change of the timeline"]
    },
    text: `${upgraded ? `upgraded ${data.slug} from version ${existing.version} to ${data.version} (${changes.join(", ") || "no structural change"})` : `applied ${data.slug} version ${data.version}`} \u2013 ${EDIT_RECIPE_FILES.lock} and project.json${data.status !== "published" ? ` (status: ${data.status})` : ""}`
  };
}
async function submit(ctx, ticket, file, options) {
  const value2 = checkTicket(ticket);
  const pack = await loadBrandPackModules(ctx.env);
  const target = path32.resolve(ctx.root, file ?? EDIT_RECIPE_FILES.draft);
  const result = validateRecipe(await readRecipeFile(target), pack.catalog);
  if (!result.recipe || !result.valid) throw new CliError("recipe-invalid", `${path32.basename(target)} is not a valid recipe: ${result.issues.slice(0, 5).map(formatIssue).join("; ")}`, { issues: result.issues });
  const todo = [...canonicalRecipeJson(result.recipe).matchAll(/"TODO: /g)].length;
  if (todo) throw new CliError("recipe-todo", `${path32.basename(target)} still has ${todo} "TODO: " text(s): complete them with the editor before publishing`);
  const sha2563 = recipeSha256(result.recipe);
  const { data } = await postTransfer(ctx, "/api/agent-transfer/recipe-submit", { ticket: value2, recipe: result.recipe }, false);
  if (data.sha256 !== sha2563) throw new CliError("recipe-corrupt", `Dark Mind stored SHA-256 ${data.sha256.slice(0, 12)}\u2026, the draft has ${sha2563.slice(0, 12)}\u2026; fetch the version (recipe_get) and compare`);
  const lock = await readRecipeLock(ctx.root).catch(() => null);
  let relocked = false;
  if (lock?.source === "draft" && lock.sha256 === sha2563) {
    await applyRecipeToProject(ctx, pack, result.recipe, { version: data.version, source: "catalog", publishedAt: data.publishedAt }, { force: options.force });
    relocked = true;
  }
  return {
    data: { recipe: data.slug, version: data.version, sha256: sha2563, publishedAt: data.publishedAt, changeKinds: data.changeKinds, relocked },
    text: `published ${data.slug} version ${data.version}${data.changeKinds.length ? ` (${data.changeKinds.join(", ")})` : ""}${relocked ? `; this project now uses the published version (${EDIT_RECIPE_FILES.lock})` : ""}`
  };
}
async function status(ctx) {
  const lock = await readRecipeLock(ctx.root);
  const draft = await fs32.stat(path32.join(ctx.root, EDIT_RECIPE_FILES.draft)).catch(() => null) !== null;
  if (!lock) return { data: { recipe: null, draft }, text: `no recipe in this project${draft ? ` (${EDIT_RECIPE_FILES.draft} present)` : ""}` };
  return {
    data: { recipe: lock.slug, version: lock.version, source: lock.source, sha256: lock.sha256, publishedAt: lock.publishedAt, brandPack: lock.brandPack, lockedAt: lock.lockedAt, draft, next: "recipe_list shows the newest published version; an upgrade only with the editor (recipe_get \u2192 recipe use <ticket> --upgrade)" },
    text: `${lock.slug} ${lock.version === null ? "local draft" : `version ${lock.version}`} (${lock.source}, SHA-256 ${lock.sha256.slice(0, 12)}\u2026, brand pack ${lock.brandPack?.version ?? "?"}, since ${lock.lockedAt})${draft ? `; ${EDIT_RECIPE_FILES.draft} present` : ""}`
  };
}

// src/commands/review.ts
function parseSubject(value2) {
  if (!value2) throw new CliError("usage", `name the review subject: ${EDIT_REVIEW_SUBJECTS.join(", ")}`);
  const subject = value2.toLowerCase() === "captions" ? "captions-text" : value2.toLowerCase() === "duration" ? "duration-exception" : value2.toLowerCase();
  if (!EDIT_REVIEW_SUBJECTS.includes(subject)) throw new CliError("usage", `unknown review subject "${value2}" (${EDIT_REVIEW_SUBJECTS.join(", ")})`);
  return subject;
}
function clock(seconds2) {
  const value2 = toNumberQ(parseRational(seconds2));
  const ms = Math.round(value2 * 1e3);
  const h = Math.floor(ms / 36e5);
  const m = Math.floor(ms % 36e5 / 6e4);
  const s = ms % 6e4 / 1e3;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${s.toFixed(3).padStart(6, "0")}`;
}
var short = (hash) => hash ? hash.slice(0, 16) : "\u2013";
function describeChange(change) {
  if ("path" in change) return `${change.path}: ${JSON.stringify(change.before)} \u2192 ${JSON.stringify(change.after)}`;
  const what = change.kind ? `${change.kind}${change.id ? ` ${change.id}` : ""}` : change.id ?? "";
  switch (change.change) {
    case "added":
      return `added ${what}`;
    case "removed":
      return `removed ${what}`;
    case "order":
      return `order ${change.before.join(", ")} \u2192 ${change.after.join(", ")}`;
    default:
      if (change.textDiff) return `changed ${what}: ${change.textDiff}`;
      if (change.fields?.length) return `changed ${what}: ${change.fields.map((f) => `${f.path} ${JSON.stringify(f.before)} \u2192 ${JSON.stringify(f.after)}`).join("; ")}`;
      return `changed ${what}: ${JSON.stringify(change.before)} \u2192 ${JSON.stringify(change.after)}`;
  }
}
function subjectLine(state) {
  const detail = state.status === "approved" || state.status === "changes-requested" ? state.record : state.status === "stale" ? `${state.changes.length} change(s) since ${state.approvedRecord}` : state.status === "not-reviewable" ? state.blockers.join("; ") : state.note ?? "";
  return `  ${state.subject.padEnd(18)} ${state.status.padEnd(17)} ${detail ?? ""}`.trimEnd();
}
function gateLine(label2, gate) {
  return [`  ${label2.padEnd(18)} ${gate.status}${gate.basis !== "reviews" ? ` (${gate.basis})` : ""}`, ...gate.blockers.map((b) => `    - ${b.message}`)].join("\n");
}
function statusResult(state) {
  const proxy = evaluateGate(state, "render-proxy");
  const original = evaluateGate(state, "render-original");
  const stills = state.subjects.thumbnail.status !== "not-required" ? evaluateGate(state, "still-original") : null;
  const subjects = EDIT_REVIEW_SUBJECTS.map((name) => state.subjects[name]);
  const open = subjects.filter((s) => s.status === "missing" || s.status === "stale" || s.status === "changes-requested");
  return {
    data: {
      subjects: Object.fromEntries(subjects.map((s) => [s.subject, { ...s, changes: s.changes.slice(0, 50) }])),
      gates: { "render-proxy": proxy, "render-original": original, ...stills ? { "still-original": stills } : {} },
      problems: state.problems,
      mismatches: state.mismatches,
      next: open.length ? `darkmind-agent review show ${open[0].subject}` : original.status === "passed" ? "darkmind-agent render --original" : null
    },
    text: [
      "review subjects:",
      ...subjects.map(subjectLine),
      "gates:",
      gateLine("render --proxy", proxy),
      gateLine("render --original", original),
      ...stills ? [gateLine("thumbnail original", stills)] : [],
      ...state.problems.map((p) => `problem ${p.file}: ${p.message} [${p.code}]`)
    ].join("\n"),
    exitCode: 0
  };
}
function editorialText(state, projection) {
  const documents = state.validation.documents;
  const label2 = (sourceId) => {
    if (!sourceId) return "(no source)";
    const source = documents.sources?.sources.find((s) => s.id === sourceId);
    const name = source?.label ? ` "${source.label}"` : "";
    return source?.kind === "darkmind-video" ? `${sourceId}${name} (video ${source.videoId})` : source?.kind === "asset" ? `${sourceId}${name} (asset ${source.path})` : sourceId;
  };
  const lines = [];
  projection.sequence.forEach((item, index) => {
    if (item.kind === "scene") {
      lines.push(`${index + 1}. scene ${item.id}: ${item.description}`, ...item.text ? [`     text: "${item.text}"`] : []);
      return;
    }
    const range2 = item.range ? `${clock(item.range.in)}\u2013${clock(item.range.out)} (${(toNumberQ(parseRational(item.range.out)) - toNumberQ(parseRational(item.range.in))).toFixed(2)} s)` : "(no range)";
    const speaker = item.speaker ? ` \u2013 ${[item.speaker.name, item.speaker.role].filter(Boolean).join(", ")}` : "";
    lines.push(`${index + 1}. statement ${item.id}: ${label2(item.sourceId)} ${range2}${speaker}`, `     "${item.quote ?? ""}"`, `     context: ${item.context}`);
  });
  const broll = Object.entries(projection.broll);
  if (broll.length) lines.push("B-roll:", ...broll.map(([id2, b]) => `  ${id2}: ${label2(b.sourceId)} \u2013 ${b.description}${b.afterId ? ` (after ${b.afterId})` : ""}`));
  return lines;
}
function captionsText(state, projection) {
  const fps = parseRational(state.validation.documents.project.output.fps);
  const timing = new Map((state.validation.documents.captions?.captions ?? []).map((c) => [c.id, c]));
  return [
    `language ${projection.language}, ${projection.captions.length} captions:`,
    ...projection.captions.map((c) => {
      const t = timing.get(c.id);
      return `  ${c.id.padEnd(6)} ${t ? frameTimecode(t.start, fps) : ""} ${c.text}${c.statementId ? `  [${c.statementId}]` : c.sceneId ? `  [${c.sceneId}]` : ""}`;
    })
  ];
}
function renderText(report) {
  if (!report) return [];
  const { sync, transcription, changes } = report.checks;
  const lines = [`file ${report.output} (${report.frames} frames, ${report.durationSeconds} s, ${report.mode}, report ${report.output.replace(/\.mp4$/, ".json")})`];
  lines.push(`  sync: ${sync.status}${"maxDeviationMs" in sync && sync.maxDeviationMs !== void 0 ? ` (max ${sync.maxDeviationMs} ms)` : ""}`);
  if (transcription.status === "compared" && "hitRate" in transcription) {
    lines.push(`  transcription: ${((transcription.hitRate ?? 0) * 100).toFixed(1)} % of the caption words heard, ${transcription.deviations.length} captions with deviations`);
  } else lines.push(`  transcription: ${transcription.status}`);
  if (changes.status === "compared" && "changed" in changes) {
    lines.push(`  changed against ${changes.against}: ${changes.changed.length ? changes.changed.map((r) => `${r.from}\u2013${r.to}`).join(", ") : "nothing"}`);
  } else lines.push(`  changes: ${changes.status}`);
  return lines;
}
function thumbnailText(projection, stills) {
  const lines = [];
  for (const [id2, still] of Object.entries(projection.stills)) {
    const definition = still.definition;
    const rendered = stills?.find((s) => s.id === id2);
    const state = rendered?.current ? `rendered for this state (${rendered.mode}), sha256 ${short(rendered.sha256)}` : `not rendered for this state \u2013 ${rendered?.reason ?? "unknown"}`;
    lines.push(`still image ${id2}: ${definition.output.path} (${definition.output.width}x${definition.output.height}) \u2013 ${state}`);
    for (const [key, value2] of Object.entries(definition.parameters ?? {})) {
      const frame2 = value2;
      const at = frame2 && typeof frame2 === "object" && typeof frame2.in === "string" ? ` (${clock(frame2.in)})` : "";
      lines.push(`  ${key}: ${JSON.stringify(value2)}${at}`);
    }
    for (const [sourceId, identity] of Object.entries(still.sources)) {
      lines.push(`  source ${sourceId}: ${identity?.kind === "darkmind-video" ? `video ${identity.videoId}` : identity?.kind === "asset" ? `asset sha256 ${short(identity.sha256)}` : "unknown"}`);
    }
  }
  lines.push("Show the image file(s) to the editor; the approval covers frame, headline and every other parameter shown here.");
  return lines;
}
function showText(state, subject, target, stills) {
  const current = state.subjects[subject];
  const lines = [`${subject} review \u2013 status ${current.status}`];
  if (subject === "editorial") lines.push(...editorialText(state, target.snapshot));
  if (subject === "captions-text") lines.push(...captionsText(state, target.snapshot));
  if (subject === "thumbnail") lines.push(...thumbnailText(target.snapshot, stills));
  if (subject === "duration-exception") {
    const d = target.snapshot;
    lines.push(`The timeline is ${d.seconds} s (${d.frames} frames at ${d.fps} fps), outside the duration frame ${d.minSeconds}\u2013${d.maxSeconds} s.`, "Nothing is cut automatically; the editor decides whether this length is accepted for the current preview state.");
  }
  if (subject === "preview" || subject === "final") lines.push(...renderText(target.render?.report));
  if (current.status === "stale" && current.changes.length) {
    lines.push(`changes since the approval ${current.approvedRecord}:`, ...current.changes.slice(0, 40).map((c) => `  ${describeChange(c)}`));
    if (current.changes.length > 40) lines.push(`  \u2026 ${current.changes.length - 40} more (use --json)`);
  }
  lines.push(...target.warnings.map((w) => `warning: ${w}`));
  if (target.blockers.length) lines.push("cannot be approved yet:", ...target.blockers.map((b) => `  - ${b}`));
  lines.push(`hash ${target.hash}`);
  if (!target.blockers.length) {
    const render = target.render ? ` --render ${target.render.file}` : "";
    lines.push(
      "Show this to the editor. Only after the editor's explicit confirmation, record it:",
      `  darkmind-agent review approve ${subject} --hash ${target.hash.slice(0, 16)}${render} --by "<editor>" --confirmation "<the editor's words>"`,
      `  (changes wanted: darkmind-agent review reject ${subject} --hash ${target.hash.slice(0, 16)} --by "<editor>" --confirmation "<the editor's words>" --comment "<what to change>")`
    );
  }
  return lines;
}
async function showResult(ctx, subject, options, tools) {
  const state = await computeReviewState(ctx.root);
  const stills = subject === "thumbnail" ? await stillRenders(ctx.root, state, tools, ctx.env) : void 0;
  const target = await reviewTarget(ctx.root, state, subject, { render: options.render, stills });
  const current = state.subjects[subject];
  const recipe = subject === "editorial" || subject === "preview" || subject === "final" ? await recipeReviewNotes(ctx).catch(() => null) : null;
  const recipeLines = recipe ? [
    `recipe ${recipe.recipe.slug} ${recipe.recipe.version === null ? "draft" : `version ${recipe.recipe.version}`}: ${recipe.deviations.length} deviation(s) from the recipe${recipe.deviations.length ? " \u2013 name each one to the editor (fine when the editor asked for it)" : ""}`,
    ...recipe.deviations.slice(0, 30).map((d) => `  deviation ${d.code}: ${d.message}`),
    ...recipe.hints.slice(0, 10).map((h) => `  hint ${h.code}: ${h.message}`)
  ] : [];
  return {
    data: {
      subject,
      status: current.status,
      hash: target.hash,
      approvable: target.blockers.length === 0,
      blockers: target.blockers,
      warnings: target.warnings,
      content: target.snapshot,
      changes: current.changes,
      approvedRecord: current.approvedRecord,
      record: current.record,
      render: target.render ? { report: target.render.file, output: target.render.report?.output ?? null, checks: target.render.report?.checks ?? null, problems: target.render.problems } : null,
      ...stills ? { stills } : {},
      ...recipe ? { recipe } : {},
      next: target.blockers.length ? null : `After the editor's explicit confirmation: darkmind-agent review approve ${subject} --hash ${target.hash.slice(0, 16)}${target.render ? ` --render ${target.render.file}` : ""} --by "<editor>" --confirmation "<the editor's words>"`
    },
    text: [...showText(state, subject, target, stills), ...recipeLines].join("\n"),
    exitCode: 0
  };
}
async function decisionResult(ctx, decision, subject, options, tools) {
  let method = "relayed";
  let hash = options.hash;
  let reviewer = options.by;
  const stills = subject === "thumbnail" ? await stillRenders(ctx.root, await computeReviewState(ctx.root), tools, ctx.env) : void 0;
  if (!options.confirmation) {
    if (!ctx.prompt) {
      throw new CliError(
        "confirmation-required",
        `--confirmation "<the editor's words>" is required: record a review only after the editor explicitly confirmed it (or the editor runs this command in an interactive terminal). The agent never approves on its own.`
      );
    }
    const state2 = await computeReviewState(ctx.root);
    const target2 = await reviewTarget(ctx.root, state2, subject, { render: options.render, stills });
    let intro = `${showText(state2, subject, target2, stills).join("\n")}
`;
    if (!reviewer) {
      reviewer = (await ctx.prompt(`${intro}Name of the editor who decides: `))?.trim();
      intro = "";
    }
    const word = decision === "approved" ? "approve" : "reject";
    const answer = await ctx.prompt(`${intro}Type "${word}" to record this decision of ${reviewer || "the editor"} (anything else cancels): `);
    if (answer?.trim().toLowerCase() !== word) throw new CliError("not-confirmed", "Cancelled; nothing was recorded.");
    hash ??= target2.hash;
    method = "terminal";
  }
  if (!hash) throw new CliError("usage", `--hash is required: the hash shown by "darkmind-agent review show ${subject}" (at least ${MIN_HASH_PREFIX} characters), so the decision is bound to the state the editor saw`);
  const { file, record, target } = await recordReview(ctx.root, {
    subject,
    decision,
    hash,
    reviewer,
    confirmation: { method, statement: options.confirmation ?? null },
    comment: options.comment ?? null,
    render: options.render,
    stills,
    now: options.now
  });
  const state = await computeReviewState(ctx.root);
  const proxy = evaluateGate(state, "render-proxy");
  const original = evaluateGate(state, "render-original");
  return {
    data: { written: file, record, gates: { "render-proxy": proxy, "render-original": original }, warnings: target.warnings },
    text: [
      `${decision === "approved" ? "approved" : "changes requested"}: ${subject} (hash ${short(record.hash)}) by ${record.reviewer.name}, confirmation ${record.confirmation.method} \u2013 ${file}`,
      ...target.warnings.map((w) => `warning: ${w}`),
      "gates:",
      gateLine("render --proxy", proxy),
      gateLine("render --original", original)
    ].join("\n"),
    exitCode: 0
  };
}
async function reviewCommand(ctx, action, subjectArg, options, tools = defaultTools(ctx.env)) {
  switch (action ?? "status") {
    case "status":
      return statusResult(await computeReviewState(ctx.root));
    case "show":
      return showResult(ctx, parseSubject(subjectArg), options, tools);
    case "approve":
      return decisionResult(ctx, "approved", parseSubject(subjectArg), options, tools);
    case "reject":
      return decisionResult(ctx, "changes-requested", parseSubject(subjectArg), options, tools);
    default:
      throw new CliError("usage", `unknown review action "${action}" (status, show, approve, reject)`);
  }
}

// src/commands/upload.ts
async function uploadCommand(ctx, ticket, options = {}) {
  if (!ticket) throw new CliError("invalid-input", "Usage: darkmind-agent upload <ticket>");
  const config = await requireConfig(ctx.root);
  const manifest = await readManifestFile(statePaths(ctx.root).manifest);
  if (!manifest) throw new CliError("no-manifest", 'No .darkmind/manifest.json; run "darkmind-agent manifest" (and project_push_begin) first.');
  const server = resolveServer(ctx.server, config, ctx.env);
  const transfer = expectKind(await redeemTicket(server, ticket), "push", "upload");
  if (transfer.projectId.toLowerCase() !== config.projectId) {
    throw new CliError("project-mismatch", `The ticket belongs to project ${transfer.projectId}, this folder to ${config.projectId}.`);
  }
  const bySha = new Map(manifest.files.map((file) => [file.sha256, file]));
  const foreign = transfer.objects.filter((object) => bySha.get(object.sha256)?.size !== object.size);
  if (foreign.length > 0) {
    throw new CliError(
      "manifest-mismatch",
      `The push expects ${foreign.length} object(s) that are not in .darkmind/manifest.json (the manifest changed after project_push_begin). Call project_push_begin again with the current manifest.`
    );
  }
  const total = transfer.objects.length;
  let done = 0;
  const results = await runPool(transfer.objects, options.concurrency ?? 4, async (object) => {
    const file = bySha.get(object.sha256);
    try {
      const outcome = await uploadObject(object.url, { path: file.path, absolutePath: toAbsolute(ctx.root, file.path), sha256: object.sha256, size: object.size }, options);
      ctx.progress(`uploaded ${++done}/${total} ${file.path} (${formatBytes(object.size)})`);
      return { path: file.path, sha256: object.sha256, size: object.size, outcome };
    } catch (error) {
      ctx.progress(`failed ${file.path}: ${errorMessage(error)}`);
      return { path: file.path, sha256: object.sha256, size: object.size, error: error instanceof CliError ? error : new CliError("upload-failed", errorMessage(error)) };
    }
  });
  let remaining = 0;
  let remainingObjects = [];
  if (total > 0) {
    const check2 = expectKind(await redeemTicket(server, ticket), "push", "upload");
    remaining = check2.objects.length;
    const errors = new Map(results.filter((result) => "error" in result).map((result) => [result.sha256, result.error]));
    remainingObjects = check2.objects.map((object) => {
      const error = errors.get(object.sha256);
      return {
        path: bySha.get(object.sha256)?.path ?? object.sha256,
        size: object.size,
        ...error ? { code: error.code, error: error.message } : { error: "not uploaded" }
      };
    });
  }
  const uploaded = results.filter((result) => "outcome" in result && result.outcome === "uploaded");
  const uploadedBytes = uploaded.reduce((sum, result) => sum + result.size, 0);
  if (remaining > 0) {
    const changed = remainingObjects.some((object) => object.code === "file-changed");
    throw new CliError(
      changed ? "file-changed" : "upload-incomplete",
      `${remaining} of ${total} object(s) are still missing${changed ? " (files changed since the manifest)" : ""}. ` + (changed ? 'Run "darkmind-agent manifest" and project_push_begin again.' : "Run the same upload command again to resume."),
      { remainingObjects, uploadedObjects: uploaded.length }
    );
  }
  return {
    data: {
      projectId: transfer.projectId,
      pushId: transfer.pushId,
      baseVersion: transfer.baseVersion,
      uploadedObjects: uploaded.length,
      uploadedBytes,
      presentObjects: transfer.presentObjects + (total - uploaded.length),
      remainingObjects: 0,
      next: `project_push_commit(pushId "${transfer.pushId}", message), then "darkmind-agent pushed <version>"`
    },
    text: `Uploaded ${uploaded.length} object(s), ${formatBytes(uploadedBytes)}; nothing missing. Next: project_push_commit(pushId "${transfer.pushId}"), then "darkmind-agent pushed <version>".`
  };
}

// src/cli.ts
var HELP = `darkmind-agent ${AGENT_VERSION} \u2013 local helper for AI agents working on Dark Mind cut projects.
Transfers run with tickets from the Dark Mind MCP tools; the script has no login of its own.

Usage: darkmind-agent <command> [options]

Project folder
  init <projectId>              Write darkmind.json and .darkmindignore (defaults) in the folder
  manifest [--print] [--allow-invalid]
                                Hash the files to push, write .darkmind/manifest.json. Editing pipeline projects:
                                video references are derived from the pipeline (darkmind.json is updated, research
                                videos dropped) and every file the pipeline needs must be pushed; an invalid
                                pipeline stops unless --allow-invalid (work in progress: keeps all references)
  status                        Changes since the base version (incl. derived video references)
  upload <ticket>               Upload missing objects of a push (project_push_begin); resumable
  pushed <version>              After project_push_commit: make the pushed manifest the base version
  download <ticket> [--force]   Restore a version (project_pull); --force replaces local changes

Media
  media <ticket> [--range <videoId>:<from>-<to>]... [--out <dir>] [--force] [--no-refs] [--no-cache]
                                Proxies (ffmpeg, complete or excerpts) or originals (get_media_sources)
                                into media/proxy or media/original; adds the videos to darkmind.json.
                                Complete proxies and originals go through the shared media cache
                                (~/.darkmind/media, DARKMIND_MEDIA_CACHE; "off" disables it): loaded once per
                                computer, linked into every project folder; excerpts are cut from a cached
                                complete proxy without a transfer. Large originals load with parallel Range
                                requests (DARKMIND_AGENT_DOWNLOAD_STREAMS, default 4)
  cache [status]                What the media cache holds (per video, project links, interrupted downloads)
  cache prune [--unused] [--older-than <days>] [--video <id>]... [--kind original|proxy] [--all] [--print]
                                Remove cache entries (no automatic limit); --unused: entries no project folder
                                links to; --print shows only. Project folders keep their hard-linked files
  brand-assets <ticket> [--to <dir>] [--force]
                                Loud Society brand assets (get_brand_assets: Neuborn, logos, audio, images; internal
                                use only) into the skill folder's brand/assets (or --to) for the brand pack's add-block

Editing pipeline (local, format contract v1)
  validate [--ready]            Check project.json, sources, edit draft, timeline, captions and extensions;
                                lists errors, pending points and warnings with file, field and clip ID;
                                --ready also fails while points are pending
  import-cutlist [--from <file>] [--profile vertical|landscape] [--title <text>] [--force]
                                Convert an Explore cutlist (default cutlist.json, kept unchanged) into a
                                reviewable draft: project.json, sources.json, edit.json, brief.md
  probe [--source <id>]... [--ticket <original media ticket>] [--force]
                                Record ffprobe facts of the originals (local in media/original/ or via the
                                ticket's URLs, header and index only) and assets in sources.json
  plan [--proxy|--original] [--print]
                                Read-only: execution plan, preflight (media, tools) and missing media
  render [--proxy|--original] [--section <from>-<to>] [--no-captions] [--no-checks]
                                Render the proxy preview (default) or the final output from the originals
                                into renders/; cached segments, verified output, checks (sync, transcription,
                                changes against the previous version) in the report next to the video.
                                Review gates: a full proxy needs the editorial review (recipe projects: first
                                pass without), --original needs editorial, caption text, preview and, outside
                                the duration frame, a duration exception; sections of the proxy need none.
                                Extensions of the timeline are brought up to date first (approved ones only)
  preview [--port <n>]          Local browser preview of the current state (proxies, timeline, captions),
                                scrubbing, in/out points, auto-reload; no render
  captions-words <file>... [--caption <id>]... [--print]
                                Word timings (saved results of the MCP tool get_word_timings) into captions.json
                                "words" by rule W1: timeline frames of the statement clip, clamped to the caption;
                                the caption text stays as reviewed (corrected words interpolated, emphasis kept);
                                --print shows the result without writing
  levels [--proxy|--original] [--target <LUFS>] [--apply]
                                Dialogue levels: measures every dialog clip of the timeline (its own range of the
                                proxy or original) and proposes the clip gain that brings it to the dialogue
                                reference (audio_master target \u2212 2 dB, default \u221216 LUFS; brand sounds sit at the
                                target); --apply writes the gains into timeline.json (preview review only)
Extensions (free building blocks: local scripts that render scenes/graphics into renders/extensions/)
  extensions [status] [--proxy|--original]
                                State of every extension (current, restorable, stale, blocked) and whether its
                                command is approved in this folder; runs nothing
  extensions show <id>          Command, program and tools as installed here, scripts with SHA-256, changes
                                since the last approval, inputs, output contract and the approval hash
  extensions approve <id> --hash <hash> [--yes]
                                Local approval to run exactly the shown command and scripts in this folder
                                (.darkmind/, not synced, not a review): the user types "run" in an interactive
                                terminal, or --yes after the user has seen them and agreed. No sandbox
  extensions run [<id>...] [--proxy|--original] [--force]
                                Render stale extensions in input order (approved commands only), restore cached
                                runs, check every output against its contract; render does this for the
                                extensions of the timeline. Missing inputs are never regenerated

Reviews (editorial work control; decisions of the editor only, never of the agent)
  review [status]               State of the reviews (editorial, captions-text, preview, duration-exception,
                                final) and of the gates in front of render --proxy and render --original
  review show <subject>         What the editor reviews, changes since the last approval and the state hash
  review approve <subject> --hash <hash> --by <editor> --confirmation <the editor's words> [--render <report>]
                                Record the editor's explicit approval of exactly the shown state (without
                                --confirmation only in an interactive terminal, where the editor confirms)
  review reject <subject> --hash <hash> --by <editor> --confirmation <words> --comment <what to change>

Format recipes (data from the Dark Mind recipe catalog; the project works with the copy in recipe.lock.json)
  recipe validate [<file>]      Check a recipe (default recipe.draft.json): schema, own references and every block,
                                profile, caption style, check and capability against the brand pack of this skill
  recipe show [<file>]          The recipe as Markdown (default: the project's recipe.lock.json) \u2013 for the editor
  recipe try [<file>] [--force] Apply a local recipe draft (default recipe.draft.json) to this test project:
                                recipe.lock.json (source draft) and project.json output, duration, recipe and
                                audioMaster; refuses a profile change on a built timeline without --force
  recipe check [--done]         The project against its locked recipe: errors (brand pack, format contract) block,
                                deviations from the recipe are reported (the editor may ask for them), pending,
                                warnings, hints; --done also needs the reviews of the recipe ("finished")
  recipe chapters [--out <file>]
                                YouTube chapter list of recipes with chapters (derived or from chapters.json)
  recipe derive [--id <slug>] [--out <file>] [--force] [--print]
                                Recipe skeleton from this project (default recipe.draft.json): profile, length,
                                blocks, sections, order, hook, end; concept, material and rules stay TODO
  recipe use <ticket> [--upgrade] [--draft] [--force]
                                Freeze a catalog version (ticket of recipe_get) into the project: recipe.lock.json and
                                project.json; another version of the same recipe only with --upgrade (after the editor
                                agreed; preview and final reviews again); --draft writes recipe.draft.json instead
  recipe submit <ticket> [<file>]
                                Publish the local draft (default recipe.draft.json, no TODO left) with a ticket of
                                recipe_publish_begin \u2013 only on the editor's explicit request; a test project that
                                tried the same draft is moved to the published version
  recipe status                 The project's recipe (version, source, SHA-256, brand pack); compare with recipe_list

Premiere hand-off (one-way; Premiere changes are never transferred back)
  export premiere [--handles <seconds>] [--attach <project file>]...
                                Package for Premiere Pro in renders/premiere/vNNNN/: xmeml timeline (cuts, B-roll,
                                framing, separate audio tracks, levels), captions as SRT (brand captions: only the
                                rendered overlay on a track of its own, T8), every medium (conform media for
                                VFR/rotated sources with handles, default 5 s), manifest with hashes and IMPORT.md
                                (import order, rendered vs. native parts, brand blocks, loudness target). The
                                approved thumbnail from the original and --attach files (e.g. the chapter list) go
                                next to IMPORT.md. Needs the same approvals as render --original; extensions are
                                brought up to date first
  export premiere --proxy [--handles <seconds>] [--attach <project file>]...
                                The same package before the originals are downloaded: the XML names the hi-res
                                media (offline in Premiere at first), proxies/ holds <name>_Proxy files from the
                                complete proxies (exact divisor of the hi-res size, same rate, length, channels) for
                                Proxy > Attach Proxies; sound derivatives get placeholder sound, source-reading
                                extensions are rendered from proxies. Needs the complete proxies and the recorded
                                facts of the originals (probe --ticket); same approvals as export premiere
  export hires [<folder>]       Put the hi-res media into a proxy package (default: the newest): originals from
                                media/original/ (must match the recorded facts), conform/stereo files with the
                                recorded recipe, extensions from the originals; built next to the package, then
                                moved into media/ \u2013 stops with premiere-open while Premiere holds a file
  export verify [<folder>]      Check a package (also after moving it): files, sizes, SHA-256, XML media paths;
                                reports the hi-res files a proxy package still waits for

Dark Mind plugin (GitHub Copilot and Claude Code: skill, this script and the Dark Mind MCP server)
  plugin install [--client copilot|claude|none]... [--remove-legacy] [--local [--to <dir>]]
                                Register the plugin of this Dark Mind in every client found (copilot, claude; or
                                DARKMIND_COPILOT/DARKMIND_CLAUDE): Claude Code gets the marketplace Dark Mind hosts
                                (/plugins/marketplace.json), GitHub Copilot the public git marketplace Dark Mind names
                                (/plugins/clients.json); plugin darkmind@darkmind. Without one (or with --local) the
                                client gets the local marketplace folder ~/.darkmind/marketplace (--to,
                                DARKMIND_PLUGIN_HOME). Moves brand assets of an older skill folder to
                                ~/.darkmind/brand-assets. Reports an older manual setup (skill folders, MCP entries for
                                this Dark Mind); --remove-legacy removes it where the plugin is registered
  plugin update [...]           The same, and updates the plugin in every client (marketplace update + plugin update)
  plugin status [...]           Served version, marketplace and plugin version per client, older manual setup

Other
  doctor                        Check Node, ffmpeg/ffprobe, project folder and Dark Mind
  version                       Print the version

Options
  --json                        One JSON object on stdout ({ "ok": true, ... } or { "ok": false, "error": ... })
  --dir <path>                  Project folder (default: current directory)
  --server <url>                Dark Mind URL (default: DARKMIND_URL, darkmind.json, download origin)
  --concurrency <n>             Parallel transfers
  --warn-mb <n>                 manifest/status: warn about generated media files above n MB (default 100)
  --quiet                       No progress output

Exit codes: 0 ok, 1 error or some items failed, 2 usage error.`;
var OPTIONS = {
  json: { type: "boolean" },
  dir: { type: "string" },
  server: { type: "string" },
  force: { type: "boolean" },
  print: { type: "boolean" },
  out: { type: "string" },
  range: { type: "string", multiple: true },
  "no-refs": { type: "boolean" },
  "no-cache": { type: "boolean" },
  unused: { type: "boolean" },
  all: { type: "boolean" },
  "older-than": { type: "string" },
  kind: { type: "string" },
  video: { type: "string", multiple: true },
  concurrency: { type: "string" },
  "warn-mb": { type: "string" },
  "allow-invalid": { type: "boolean" },
  ready: { type: "boolean" },
  from: { type: "string" },
  profile: { type: "string" },
  title: { type: "string" },
  proxy: { type: "boolean" },
  original: { type: "boolean" },
  section: { type: "string" },
  "no-captions": { type: "boolean" },
  "no-checks": { type: "boolean" },
  source: { type: "string", multiple: true },
  ticket: { type: "string" },
  port: { type: "string" },
  hash: { type: "string" },
  by: { type: "string" },
  confirmation: { type: "string" },
  comment: { type: "string" },
  render: { type: "string" },
  yes: { type: "boolean" },
  handles: { type: "string" },
  attach: { type: "string", multiple: true },
  to: { type: "string" },
  caption: { type: "string", multiple: true },
  target: { type: "string" },
  apply: { type: "boolean" },
  id: { type: "string" },
  done: { type: "boolean" },
  upgrade: { type: "boolean" },
  draft: { type: "boolean" },
  client: { type: "string", multiple: true },
  "remove-legacy": { type: "boolean" },
  local: { type: "boolean" },
  quiet: { type: "boolean" },
  help: { type: "boolean", short: "h" },
  version: { type: "boolean", short: "v" }
};
async function terminalPrompt(question) {
  const { createInterface } = await import("node:readline/promises");
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  try {
    return await rl.question(question);
  } catch {
    return null;
  } finally {
    rl.close();
  }
}
var defaultIo = {
  stdout: (text3) => process.stdout.write(text3),
  stderr: (text3) => process.stderr.write(text3),
  env: process.env,
  cwd: process.cwd(),
  isTty: Boolean(process.stderr.isTTY),
  ...process.stdin.isTTY ? { prompt: terminalPrompt } : {}
};
function positiveInt2(value2, name) {
  if (value2 === void 0) return void 0;
  const parsed = Number(value2);
  if (!Number.isInteger(parsed) || parsed < 1) throw new CliError("usage", `--${name} must be a positive integer`);
  return parsed;
}
function envBytes(env, name) {
  const value2 = Number(env[name]);
  return Number.isInteger(value2) && value2 > 0 ? value2 : void 0;
}
async function main(argv, io = defaultIo) {
  let json2 = argv.includes("--json");
  try {
    if (nodeMajor() < MIN_NODE_MAJOR) throw new CliError("node-too-old", `Node ${process.versions.node} is too old; darkmind-agent needs Node >= ${MIN_NODE_MAJOR}.`);
    let parsed;
    try {
      parsed = parseArgs({ args: argv, options: OPTIONS, allowPositionals: true, strict: true });
    } catch (error) {
      throw new CliError("usage", `${errorMessage(error)}. Run "darkmind-agent --help".`);
    }
    const { values, positionals } = parsed;
    json2 = Boolean(values.json);
    const [command, ...args] = positionals;
    if (values.version || command === "version") {
      emit(io, json2, { data: { version: AGENT_VERSION }, text: AGENT_VERSION });
      return 0;
    }
    if (values.help || !command || command === "help") {
      io.stdout(`${HELP}
`);
      return command || values.help ? 0 : 2;
    }
    const ctx = {
      root: path33.resolve(io.cwd, values.dir ?? "."),
      server: values.server,
      env: io.env,
      progress: (message) => {
        if (io.isTty && !values.quiet && !json2) io.stderr(`${message}
`);
      },
      ...io.prompt && !json2 ? { prompt: io.prompt } : {}
    };
    const concurrency = positiveInt2(values.concurrency, "concurrency");
    const warnFileMb = positiveInt2(values["warn-mb"], "warn-mb");
    const uploadTuning = {
      putBlobMaxBytes: envBytes(io.env, "DARKMIND_AGENT_PUT_BLOB_MAX_BYTES"),
      blockBytes: envBytes(io.env, "DARKMIND_AGENT_BLOCK_BYTES")
    };
    let result;
    switch (command) {
      case "init":
        result = await initCommand(ctx, args[0], { force: values.force });
        break;
      case "manifest":
        result = await manifestCommand(ctx, { print: values.print, warnFileMb, allowInvalid: values["allow-invalid"] });
        break;
      case "status":
        result = await statusCommand(ctx, { warnFileMb });
        break;
      case "upload":
        result = await uploadCommand(ctx, args[0], { concurrency, ...uploadTuning });
        break;
      case "pushed":
        result = await pushedCommand(ctx, args[0], { force: values.force });
        break;
      case "download":
        result = await downloadCommand(ctx, args[0], { force: values.force, concurrency });
        break;
      case "media":
        result = await mediaCommand(ctx, args[0], { out: values.out, ranges: values.range, force: values.force, noRefs: values["no-refs"], noCache: values["no-cache"], concurrency });
        break;
      case "cache": {
        const days = values["older-than"];
        if (days !== void 0 && !(Number(days) >= 0)) throw new CliError("usage", "--older-than must be a number of days");
        result = await cacheCommand(ctx, args[0], {
          unused: values.unused,
          olderThanDays: days === void 0 ? void 0 : Number(days),
          videos: values.video,
          kind: values.kind,
          all: values.all,
          print: values.print
        });
        break;
      }
      case "brand-assets":
        result = await brandAssetsCommand(ctx, args[0], { to: values.to, force: values.force });
        break;
      case "doctor":
        result = await doctorCommand(ctx);
        break;
      case "plugin":
        if (args.length > 1) throw new CliError("usage", `plugin takes one action, not "${args.join(" ")}"`);
        result = await pluginCommand(ctx, args[0], { to: values.to, clients: values.client, removeLegacy: values["remove-legacy"], local: values.local });
        break;
      case "validate":
        result = await validateCommand(ctx, { ready: values.ready });
        break;
      case "probe":
        result = await probeCommand(ctx, { sources: values.source, ticket: values.ticket, force: values.force });
        break;
      case "plan":
        result = await planCommand(ctx, { proxy: values.proxy, original: values.original, print: values.print });
        break;
      case "render":
        result = await withInterrupt((signal) => renderCommand(ctx, { proxy: values.proxy, original: values.original, section: values.section, noCaptions: values["no-captions"], noChecks: values["no-checks"], signal }));
        break;
      case "preview":
        result = await withInterrupt((signal) => previewCommand(ctx, { port: positiveInt2(values.port, "port"), signal, log: (line) => io.stderr(`${line}
`) }));
        break;
      case "import-cutlist":
        result = await importCutlistCommand(ctx, { from: values.from, profile: values.profile, title: values.title, force: values.force });
        break;
      case "captions-words":
        result = await captionsWordsCommand(ctx, args, { captions: values.caption, print: values.print });
        break;
      case "levels":
        result = await levelsCommand(ctx, { proxy: values.proxy, original: values.original, target: values.target, apply: values.apply });
        break;
      case "review":
        if (args.length > 2) throw new CliError("usage", `review takes an action and a subject, not "${args.slice(2).join(" ")}"`);
        result = await reviewCommand(ctx, args[0], args[1], { hash: values.hash, by: values.by, confirmation: values.confirmation, comment: values.comment, render: values.render });
        break;
      case "recipe":
        result = await recipeCommand(ctx, args[0], args.slice(1), { force: values.force, print: values.print, out: values.out, id: values.id, done: values.done, upgrade: values.upgrade, draft: values.draft });
        break;
      case "extensions":
        result = await withInterrupt(
          (signal) => extensionsCommand(ctx, args[0], args.slice(1), { proxy: values.proxy, original: values.original, hash: values.hash, yes: values.yes, force: values.force, signal })
        );
        break;
      case "export":
        result = await withInterrupt((signal) => exportCommand(ctx, args[0], args.slice(1), { handles: values.handles, attach: values.attach, proxy: values.proxy, signal }));
        break;
      default:
        throw new CliError("usage", `Unknown command "${command}". Run "darkmind-agent --help".`);
    }
    if (command === "manifest" && values.print) {
      io.stdout(`${result.text}
`);
    } else {
      emit(io, json2, result);
    }
    return result.exitCode ?? 0;
  } catch (error) {
    const cliError = error instanceof CliError ? error : new CliError("internal-error", errorMessage(error));
    if (json2) {
      io.stdout(
        `${JSON.stringify({ ok: false, error: { code: cliError.code, message: cliError.message, ...cliError.details !== void 0 ? { details: cliError.details } : {} } })}
`
      );
    } else {
      io.stderr(`error [${cliError.code}]: ${cliError.message}
`);
      if (cliError.details !== void 0) io.stderr(`${JSON.stringify(cliError.details)}
`);
    }
    return cliError.code === "usage" ? 2 : 1;
  }
}
async function withInterrupt(fn) {
  const controller = new AbortController();
  const onSignal = () => controller.abort();
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  try {
    return await fn(controller.signal);
  } finally {
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
  }
}
function emit(io, json2, result) {
  if (json2) io.stdout(`${JSON.stringify({ ok: (result.exitCode ?? 0) === 0, ...result.data })}
`);
  else io.stdout(`${result.text}
`);
}

// src/main.ts
process.exitCode = await main(process.argv.slice(2));
