const message = "Do not mix named exports and default exports.";

/** @type {import('eslint').Rule.RuleModule} */
export const noMixedExport = {
	meta: {
		type: "problem",
		docs: {
			description: message,
		},
	},

	create(context) {
		let hasNamed = false;
		let hasDefault = false;

		return {
			Program(node) {
				hasDefault = node.body.some(statement => statement.type === "ExportDefaultDeclaration");
				hasNamed = node.body.some(statement =>
					(
						statement.type === "ExportAllDeclaration" ||
						statement.type === "ExportNamedDeclaration"
					) &&
					statement.exportKind !== "type");
			},

			ExportAllDeclaration(node) {
				if (hasDefault && node.exportKind !== "type") {
					context.report({ node, message });
				}
			},

			ExportDefaultDeclaration(node) {
				if (hasNamed) {
					context.report({ node, message });
				}
			},

			ExportNamedDeclaration(node) {
				if (hasDefault && node.exportKind !== "type") {
					context.report({ node, message });
				}
			},
		};
	},
};
