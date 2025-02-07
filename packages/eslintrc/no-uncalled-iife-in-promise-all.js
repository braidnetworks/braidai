/** @type {import('eslint').Rule.RuleModule} */
export const noUncalledIIFEInPromiseAll = {
	meta: {
		type: "problem",
		fixable: "code",
		hasSuggestions: true,
		docs: {
			description: "No uncalled function expressions in Promise.all",
			recommended: false,
		},
	},

	create(context) {
		return {
			CallExpression(callNode) {
				if (callNode.callee.type === "MemberExpression" &&
					callNode.callee.object.name === "Promise" &&
					callNode.callee.property.name === "all" &&
					callNode.arguments.length === 1 &&
					callNode.arguments[0].type === "ArrayExpression"
				) {
					for (const node of callNode.arguments[0].elements) {
						if (node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") {
							context.report({
								node,
								message: "Unexpected uncalled function expression passed to Promise.all.",
								suggest: [ {
									desc: "Call the function expression",
									fix(fixer) {
										const sourceCode = context.getSourceCode();
										return fixer.replaceText(node, `${sourceCode.getText(node)}()`);
									},
								} ],
							});
						}
					}
				}
			},
		};
	},
};
