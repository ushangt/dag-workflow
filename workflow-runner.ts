interface WorkflowNode {
    name?: string;
    edges: { [key: string]: number };
    start?: boolean;
  }
  
export type WorkflowDAG = { [key: string]: WorkflowNode };

export class WorkflowRunner {
    private dag: WorkflowDAG;

    /**
     * Constructs a WorkflowRunner instance with the provided workflow DAG.
     * @param dag The directed acyclic graph representing the workflow.
     */
    constructor(dag: WorkflowDAG) {
        this.dag = dag;
        // Add a name attribute to each node before any processing begins
        for (const [key, value] of Object.entries(this.dag)) {
            value.name = key;
        }
        this.validateWorkflow();
    }

    /**
     * Initiates the execution of the workflow traversal.
     */
    async run() {
        const startNode = this.findStartNode();
        if (!startNode) {
            console.error("No start node found in the workflow.");
            return;
        }
        await this.processNode(startNode);
    }

    /**
     * Processes a node in the workflow, prints the node, and initiates processing of its outgoing edges.
     * @param node The current node to be processed.
     */
    private async processNode(node: WorkflowNode) {
        const nodeName = node.name || '';
        console.log(nodeName);

        const edgePromises: Promise<void>[] = [];

        for (const [nextNode, waitTime] of Object.entries(node.edges)) {
            const nextNodeObject = this.dag[nextNode];
            if (nextNodeObject) {
                this.validateEdge(nextNode, waitTime);
                const edgePromise = this.processEdge(nextNodeObject, waitTime);
                edgePromises.push(edgePromise);
            } else {
                console.error(`Node ${nextNode} not found in the workflow.`);
            }
        }

        await Promise.all(edgePromises);
    }

    /**
     * Processes an outgoing edge from the current node, waits for the specified time, and continues the traversal.
     * @param nextNode The next node to be processed.
     * @param waitTime The time to wait before processing the next node.
     */
    private async processEdge(nextNode: WorkflowNode, waitTime: number) {
        await this.wait(waitTime);
        await this.processNode(nextNode);
    }

    /**
     * Pauses execution for the specified duration.
     * @param ms The duration to wait in milliseconds.
     * @returns A Promise that resolves after the specified duration.
     */
    private async wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms * 1000));
    }

    /**
     * Finds and returns the start node in the workflow.
     * @returns The start node of the workflow.
     */
    private findStartNode(): WorkflowNode | undefined {
        return Object.values(this.dag).find((node) => node.start === true);
    }

    /**
     * Validates the workflow to ensure there are no cycles and validates edge wait times.
     * @throws Error if a cycle is detected or a wait time is negative.
     */
    private validateWorkflow() {
        const visitedNodes: Set<string> = new Set();

        const dfs = (node: WorkflowNode) => {
            if (visitedNodes.has(node.name || '')) {
                throw new Error(`Cycle detected in the workflow involving node ${node.name}`);
            }

            visitedNodes.add(node.name || '');

            for (const [nextNode, waitTime] of Object.entries(node.edges)) {
                this.validateEdge(nextNode, waitTime);
                const nextNodeObject = this.dag[nextNode];
                if (nextNodeObject) {
                    dfs(nextNodeObject);
                } else {
                    console.error(`Node ${nextNode} not found in the workflow.`);
                }
            }
            visitedNodes.delete(node.name || '');
        };

        for (const node of Object.values(this.dag)) {
            if (!visitedNodes.has(node.name || '')) {
                dfs(node);
            }
        }
    }

    /**
     * Validates an edge to ensure the wait time is non-negative.
     * @param nextNode The next node in the workflow.
     * @param waitTime The wait time associated with the edge.
     * @throws Error if the wait time is negative.
     */
    private validateEdge(nextNode: string, waitTime: number) {
        if (waitTime < 0) {
            throw new Error(`Negative wait time (${waitTime} seconds) on edge to node ${nextNode}`);
        }
    }
}
  