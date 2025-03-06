import { Project, SyntaxKind } from "ts-morph";

/**
 * 提取函数的详细信息
 *
 * @param {string} code - 函数的源代码
 * @param {string} functionName - 函数名称
 * @returns {Object} 函数的详细信息
 */
function extractFunctionInfo(code, functionName) {
  try {
    if (!code || !functionName) {
      return createDefaultFunctionInfo(functionName || "unknown");
    }

    const project = new Project();
    const sourceFile = project.createSourceFile("temp.ts", code);

    // 查找函数声明
    const functionDeclarations = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
    const functionDecl = functionDeclarations.find(
      (decl) => decl && typeof decl.getName === "function" && decl.getName() === functionName,
    );

    if (functionDecl) {
      // 处理函数声明
      return {
        name: functionName,
        signature: extractFunctionDeclarationSignature(functionDecl),
        description: extractJSDocDescription(functionDecl),
        parameters: extractParameters(functionDecl),
        returnType: extractReturnType(functionDecl),
        examples: extractJSDocExamples(functionDecl),
        typeParameters: extractTypeParameters(functionDecl),
      };
    }

    // 查找变量声明（可能是箭头函数或函数表达式）
    const variableDeclarations = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration);
    const varDecl = variableDeclarations.find(
      (decl) => decl && typeof decl.getName === "function" && decl.getName() === functionName,
    );

    if (varDecl) {
      const initializer = typeof varDecl.getInitializer === "function" ? varDecl.getInitializer() : null;
      if (initializer) {
        const kind = initializer.getKind();
        if (kind === SyntaxKind.ArrowFunction) {
          // 处理箭头函数
          return {
            name: functionName,
            signature: buildArrowFunctionSignature(functionName, initializer),
            description: extractJSDocDescription(varDecl),
            parameters: extractParameters(initializer),
            returnType: extractReturnType(initializer),
            examples: extractJSDocExamples(varDecl),
            typeParameters: extractTypeParameters(initializer),
          };
        } else if (kind === SyntaxKind.FunctionExpression) {
          // 处理函数表达式
          return {
            name: functionName,
            signature: buildFunctionExpressionSignature(functionName, initializer),
            description: extractJSDocDescription(varDecl),
            parameters: extractParameters(initializer),
            returnType: extractReturnType(initializer),
            examples: extractJSDocExamples(varDecl),
            typeParameters: extractTypeParameters(initializer),
          };
        }
      }
    }

    // 查找类方法
    const classes = sourceFile.getClasses();
    for (const cls of classes) {
      if (!cls) continue;

      const className = typeof cls.getName === "function" ? cls.getName() || "AnonymousClass" : "AnonymousClass";

      if (typeof cls.getMethods !== "function") continue;

      const methods = cls.getMethods();
      if (!methods) continue;

      const method = methods.find((m) => m && typeof m.getName === "function" && m.getName() === functionName);

      if (method) {
        return {
          name: functionName,
          signature: buildMethodSignature(className, method),
          description: extractJSDocDescription(method),
          parameters: extractParameters(method),
          returnType: extractReturnType(method),
          examples: extractJSDocExamples(method),
          typeParameters: extractTypeParameters(method),
        };
      }
    }

    // 如果找不到函数，尝试从代码中提取一些基本信息
    return createDefaultFunctionInfo(functionName);
  } catch (error) {
    console.error(`Error extracting function info for ${functionName}:`, error);
    return createDefaultFunctionInfo(functionName);
  }
}

/**
 * 创建默认的函数信息对象
 *
 * @param {string} functionName - 函数名称
 * @returns {Object} 默认函数信息
 */
function createDefaultFunctionInfo(functionName) {
  return {
    name: functionName,
    signature: `function ${functionName}() { ... }`,
    description: "",
    parameters: [],
    returnType: "",
    examples: [],
    typeParameters: [],
  };
}

/**
 * 提取JSDoc描述
 *
 * @param {import('ts-morph').Node} node - 节点
 * @returns {string} JSDoc描述
 */
function extractJSDocDescription(node) {
  // 检查节点是否有getJsDocs方法
  if (!node || typeof node.getJsDocs !== "function") {
    return "";
  }

  const jsDocs = node.getJsDocs();
  if (!jsDocs || jsDocs.length === 0) return "";

  const jsDoc = jsDocs[0];
  if (!jsDoc || typeof jsDoc.getDescription !== "function") {
    return "";
  }

  return jsDoc.getDescription().trim();
}

/**
 * 提取JSDoc示例
 *
 * @param {import('ts-morph').Node} node - 节点
 * @returns {string[]} JSDoc示例数组
 */
function extractJSDocExamples(node) {
  // 检查节点是否有getJsDocs方法
  if (!node || typeof node.getJsDocs !== "function") {
    return [];
  }

  const jsDocs = node.getJsDocs();
  if (!jsDocs || jsDocs.length === 0) return [];

  const examples = [];
  for (const jsDoc of jsDocs) {
    if (!jsDoc || typeof jsDoc.getTags !== "function") {
      continue;
    }

    const tags = jsDoc.getTags();
    if (!tags) continue;

    const exampleTags = tags.filter(
      (tag) => tag && typeof tag.getTagName === "function" && tag.getTagName() === "example",
    );
    for (const tag of exampleTags) {
      if (tag && typeof tag.getComment === "function") {
        const content = tag.getComment();
        if (content) examples.push(content);
      }
    }
  }

  return examples;
}

/**
 * 提取函数声明签名
 *
 * @param {import('ts-morph').FunctionDeclaration} functionDecl - 函数声明
 * @returns {string} 函数签名
 */
function extractFunctionDeclarationSignature(functionDecl) {
  const name = functionDecl.getName() || "anonymous";
  const typeParameters = functionDecl
    .getTypeParameters()
    .map((tp) => tp.getText())
    .join(", ");
  const typeParametersText = typeParameters ? `<${typeParameters}>` : "";

  const parameters = functionDecl
    .getParameters()
    .map((param) => param.getText())
    .join(", ");

  const returnTypeNode = functionDecl.getReturnTypeNode();
  const returnType = returnTypeNode ? `: ${returnTypeNode.getText()}` : "";

  return `function ${name}${typeParametersText}(${parameters})${returnType}`;
}

/**
 * 构建箭头函数签名
 *
 * @param {string} name - 函数名称
 * @param {import('ts-morph').ArrowFunction} arrowFunction - 箭头函数
 * @returns {string} 函数签名
 */
function buildArrowFunctionSignature(name, arrowFunction) {
  const typeParameters = arrowFunction
    .getTypeParameters()
    .map((tp) => tp.getText())
    .join(", ");
  const typeParametersText = typeParameters ? `<${typeParameters}>` : "";

  const parameters = arrowFunction
    .getParameters()
    .map((param) => param.getText())
    .join(", ");

  const returnTypeNode = arrowFunction.getReturnTypeNode();
  const returnType = returnTypeNode ? `: ${returnTypeNode.getText()}` : "";

  return `const ${name} = ${typeParametersText}(${parameters})${returnType} => { ... }`;
}

/**
 * 构建函数表达式签名
 *
 * @param {string} name - 函数名称
 * @param {import('ts-morph').FunctionExpression} functionExpr - 函数表达式
 * @returns {string} 函数签名
 */
function buildFunctionExpressionSignature(name, functionExpr) {
  const typeParameters = functionExpr
    .getTypeParameters()
    .map((tp) => tp.getText())
    .join(", ");
  const typeParametersText = typeParameters ? `<${typeParameters}>` : "";

  const parameters = functionExpr
    .getParameters()
    .map((param) => param.getText())
    .join(", ");

  const returnTypeNode = functionExpr.getReturnTypeNode();
  const returnType = returnTypeNode ? `: ${returnTypeNode.getText()}` : "";

  return `const ${name} = function${typeParametersText}(${parameters})${returnType} { ... }`;
}

/**
 * 构建方法签名
 *
 * @param {string} className - 类名
 * @param {import('ts-morph').MethodDeclaration} method - 方法声明
 * @returns {string} 方法签名
 */
function buildMethodSignature(className, method) {
  const name = method.getName();
  const typeParameters = method
    .getTypeParameters()
    .map((tp) => tp.getText())
    .join(", ");
  const typeParametersText = typeParameters ? `<${typeParameters}>` : "";

  const parameters = method
    .getParameters()
    .map((param) => param.getText())
    .join(", ");

  const returnTypeNode = method.getReturnTypeNode();
  const returnType = returnTypeNode ? `: ${returnTypeNode.getText()}` : "";

  const isStatic = method.isStatic() ? "static " : "";

  return `${isStatic}${name}${typeParametersText}(${parameters})${returnType}`;
}

/**
 * 提取类型参数
 *
 * @param {import('ts-morph').Node} node - 节点
 * @returns {Array<{name: string, constraint: string, default: string, description: string}>} 类型参数数组
 */
function extractTypeParameters(node) {
  if (!node || !("getTypeParameters" in node && typeof node.getTypeParameters === "function")) {
    return [];
  }

  const typeParameters = node.getTypeParameters();
  if (!typeParameters || !typeParameters.length) return [];

  let templateTags = [];
  // 尝试从JSDoc中获取模板标签
  if (typeof node.getJsDocs === "function") {
    const jsDocs = node.getJsDocs();
    if (jsDocs && jsDocs.length > 0) {
      templateTags = jsDocs.flatMap((jsDoc) => {
        if (!jsDoc || typeof jsDoc.getTags !== "function") return [];
        const tags = jsDoc.getTags();
        if (!tags) return [];
        return tags.filter((tag) => tag && typeof tag.getTagName === "function" && tag.getTagName() === "template");
      });
    }
  }

  return typeParameters.map((tp, index) => {
    if (!tp) return { name: "", constraint: "", default: "", description: "" };

    const name = typeof tp.getName === "function" ? tp.getName() : "";

    let constraint = "";
    if (typeof tp.getConstraint === "function") {
      const constraintNode = tp.getConstraint();
      if (constraintNode && typeof constraintNode.getText === "function") {
        constraint = constraintNode.getText();
      }
    }

    let defaultType = "";
    if (typeof tp.getDefault === "function") {
      const defaultNode = tp.getDefault();
      if (defaultNode && typeof defaultNode.getText === "function") {
        defaultType = defaultNode.getText();
      }
    }

    // 尝试从JSDoc中获取描述
    let description = "";
    if (templateTags[index]) {
      const tag = templateTags[index];
      if (tag && typeof tag.getComment === "function") {
        description = tag.getComment() || "";
      }
    }

    return {
      name,
      constraint,
      default: defaultType,
      description,
    };
  });
}

/**
 * 提取参数信息
 *
 * @param {import('ts-morph').Node} node - 节点
 * @returns {Array<{name: string, type: string, description: string, isOptional: boolean, defaultValue: string}>} 参数信息数组
 */
function extractParameters(node) {
  if (!node || !("getParameters" in node && typeof node.getParameters === "function")) {
    return [];
  }

  const parameters = node.getParameters();
  if (!parameters || !parameters.length) return [];

  let paramTags = [];
  // 尝试从JSDoc中获取参数标签
  if (typeof node.getJsDocs === "function") {
    const jsDocs = node.getJsDocs();
    if (jsDocs && jsDocs.length > 0) {
      paramTags = jsDocs.flatMap((jsDoc) => {
        if (!jsDoc || typeof jsDoc.getTags !== "function") return [];
        const tags = jsDoc.getTags();
        if (!tags) return [];
        return tags.filter((tag) => tag && typeof tag.getTagName === "function" && tag.getTagName() === "param");
      });
    }
  }

  return parameters.map((param) => {
    if (!param) return { name: "", type: "any", description: "", isOptional: false, defaultValue: "" };

    const name = typeof param.getName === "function" ? param.getName() : "";

    let type = "any";
    if (typeof param.getTypeNode === "function") {
      const typeNode = param.getTypeNode();
      if (typeNode && typeof typeNode.getText === "function") {
        type = typeNode.getText();
      }
    }

    const isOptional = typeof param.isOptional === "function" ? param.isOptional() : false;

    let defaultValue = "";
    if (typeof param.getInitializer === "function") {
      const initializer = param.getInitializer();
      if (initializer && typeof initializer.getText === "function") {
        defaultValue = initializer.getText();
      }
    }

    // 尝试从JSDoc中获取描述
    let description = "";
    const paramTag = paramTags.find((tag) => {
      if (!tag || typeof tag.getCommentText !== "function") return false;
      const commentText = tag.getCommentText();
      if (!commentText) return false;
      const paramName = commentText.split(" ")[0];
      return paramName === name || paramName === name.replace(/^_/, "");
    });

    if (paramTag && typeof paramTag.getCommentText === "function") {
      const commentText = paramTag.getCommentText() || "";
      const parts = commentText.split(" ");
      if (parts.length > 0) {
        parts.shift(); // 移除参数名
        description = parts.join(" ");
      }
    }

    return {
      name,
      type,
      description,
      isOptional,
      defaultValue,
    };
  });
}

/**
 * 提取返回类型
 *
 * @param {import('ts-morph').Node} node - 节点
 * @returns {string} 返回类型
 */
function extractReturnType(node) {
  if (!node || !("getReturnTypeNode" in node && typeof node.getReturnTypeNode === "function")) {
    return "";
  }

  // 优先使用显式返回类型
  const returnTypeNode = node.getReturnTypeNode();
  if (returnTypeNode && typeof returnTypeNode.getText === "function") {
    return returnTypeNode.getText();
  }

  // 尝试从JSDoc中获取返回类型
  if (typeof node.getJsDocs === "function") {
    const jsDocs = node.getJsDocs();
    if (jsDocs && jsDocs.length > 0) {
      for (const jsDoc of jsDocs) {
        if (!jsDoc || typeof jsDoc.getTags !== "function") continue;

        const tags = jsDoc.getTags();
        if (!tags) continue;

        const returnTag = tags.find(
          (tag) =>
            tag &&
            typeof tag.getTagName === "function" &&
            (tag.getTagName() === "returns" || tag.getTagName() === "return"),
        );

        if (returnTag && typeof returnTag.getCommentText === "function") {
          return returnTag.getCommentText() || "";
        }
      }
    }
  }

  // 尝试使用推断类型
  if (typeof node.getReturnType === "function") {
    try {
      const returnType = node.getReturnType();
      if (returnType && typeof returnType.getText === "function") {
        return returnType.getText();
      }
    } catch (error) {
      // 忽略推断类型时的错误
    }
  }

  return "";
}

export { extractFunctionInfo };
