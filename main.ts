//Example workflow
import { WorkflowDAG, WorkflowRunner } from "./workflow-runner";

const workflow: WorkflowDAG = {
    "A": { start: true, edges: { "B": 8, "C": 2 } },
    "B": { edges: { "D": 9, "E": 12 } },
    "C": { edges: { "F": 1, "G": 2 } },
    "D": { edges: { "E": 3 } },
    "E": { edges: {} },
    "F": { edges: {} },
    "G": { edges: {} },
};

// Create and run the workflow
const runner = new WorkflowRunner(workflow);
runner.run();