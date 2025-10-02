import type { RuleNode, Condition } from "@/lib/segmentation";

export type NodeId = string;

export type UiCondition = Condition & { id: NodeId };
export type UiGroup = { id: NodeId; kind: "and" | "or"; children: UiNode[] };
export type UiNode = UiCondition | UiGroup;

export function isGroup(n: UiNode): n is UiGroup {
	return (n as UiGroup).children !== undefined;
}

export function makeCondition(partial?: Partial<Condition>): UiCondition {
	return {
		id: crypto.randomUUID(),
		kind: "condition",
		path: partial?.path ?? "event",
		op: partial?.op ?? "eq",
		value: partial?.value ?? "",
	};
}

export function makeGroup(kind: "and" | "or", children?: UiNode[]): UiGroup {
	return {
		id: crypto.randomUUID(),
		kind,
		children: children ?? [makeCondition()],
	};
}

export function toRuleNode(ui: UiNode): RuleNode {
	if (isGroup(ui)) {
		if (ui.kind === "and")
			return { kind: "and", children: ui.children.map(toRuleNode) };
		return { kind: "or", children: ui.children.map(toRuleNode) };
	}
	const { id: _id, ...rest } = ui;
	void _id;
	return rest;
}
