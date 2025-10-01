import type { NormalizedEventRow } from "@/lib/types";
import type { RuleNode, Condition } from "./types";
import { applyOperator } from "./ops";
import { getValue } from "./getValue";

export function evalRuleOnEvent(
	node: RuleNode,
	row: NormalizedEventRow,
): boolean {
	switch (node.kind) {
		case "condition":
			return evalCondition(node, row);
		case "and":
			return node.children.every((c) => evalRuleOnEvent(c, row));
		case "or":
			return node.children.some((c) => evalRuleOnEvent(c, row));
		case "not":
			return !evalRuleOnEvent(node.child, row);
		default:
			return false;
	}
}

function evalCondition(cond: Condition, row: NormalizedEventRow): boolean {
	const left = getValue(row, cond.path);
	return applyOperator(cond.op, left, cond.value);
}
