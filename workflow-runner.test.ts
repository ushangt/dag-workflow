import { WorkflowRunner, WorkflowDAG } from './workflow-runner';

describe('WorkflowRunner', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    console.clear();
  });  
  
  test('runs the workflow correctly', async () => {
    const workflow: WorkflowDAG = {
      "A": { start: true, edges: { "B": 5, "C": 2 } },
      "B": { edges: {} },
      "C": { edges: {} },
    };

    const runner = new WorkflowRunner(workflow);

    // Mock console.log to capture printed output
    const mockLog = jest.spyOn(console, 'log'); 
    mockLog.mockImplementation(() => {});

    await runner.run();

    // Assert that console.log was called with the expected sequence
    expect(mockLog.mock.calls).toEqual([['A'], ['C'], ['B']]);

    // Restore the original implementation of console.log
    mockLog.mockRestore();
  }, 7000);

  test('handles parallel edges correctly', async () => {
    const workflow: WorkflowDAG = {
      "A": { start: true, edges: { "B": 8, "C": 2 } },
      "B": { edges: { "D": 9, "E": 12 } },
      "C": { edges: { "F": 1, "G": 2 } },
      "D": { edges: { "E": 3 } },
      "E": { edges: {} },
      "F": { edges: {} },
      "G": { edges: {} },
    };

    const runner = new WorkflowRunner(workflow);

    // Mock console.log to capture printed output
    const mockLog = jest.spyOn(console, 'log');
    mockLog.mockImplementation(() => {});

    await runner.run();

    // Assert that console.log was called with the expected sequence
    expect(mockLog.mock.calls).toEqual([
      ['A'],    // A is printed immediately
      ['C'],    // C is printed after 2 seconds
      ['F'],    // F is printed after 3 seconds (2 + 1)
      ['G'],    // G is printed after 4 seconds (2 + 2)
      ['B'],    // B is printed after 6 seconds (8 - 2)
      ['D'],    // D is printed after 17 seconds (8 + 9)
      ['E'],    // E is printed after 20 seconds (8 + 12)
      ['E'],    // E is printed after 23 seconds (8 + 12 + 3)
    ]);

    // Restore the original implementation of console.log
    mockLog.mockRestore();
  }, 25000);

  test('handles same time edges correctly', async () => {
    const workflow: WorkflowDAG = {
      "A": { start: true, edges: { "B": 2, "C": 2 } },
      "B": { edges: {} },
      "C": { edges: {} },
    };

    const runner = new WorkflowRunner(workflow);

    // Mock console.log to capture printed output
    const mockLog = jest.spyOn(console, 'log'); 
    mockLog.mockImplementation(() => {});

    await runner.run();

    // Assert that console.log was called with the expected sequence
    expect(mockLog.mock.calls).toEqual([['A'], ['B'], ['C']]);

    // Restore the original implementation of console.log
    mockLog.mockRestore();
  });

  test('throws error on cycle in the workflow', () => {
    const workflow: WorkflowDAG = {
      "A": { start: true, edges: { "B": 5 } },
      "B": { edges: { "C": 3 } },
      "C": { edges: { "A": 2 } }, // Cycle: A -> B -> C -> A
    };

    expect(() => new WorkflowRunner(workflow)).toThrow('Cycle detected in the workflow involving node A');
  });

  test('throws error on negative edge value in the workflow', () => {
    const workflow: WorkflowDAG = {
      "A": { start: true, edges: { "B": 5, "C": -2 } }, // Negative edge value
      "B": { edges: {} },
      "C": { edges: {} },
    };

    expect(() => new WorkflowRunner(workflow)).toThrow('Negative wait time (-2 seconds) on edge to node C');
  });

  test('handles missing next nodes in edges', async () => {
    const workflow: WorkflowDAG = {
      "A": { start: true, edges: { "B": 5, "D": 2 } },
      "B": { edges: {} },
      "C": { edges: {} },
    };

    const runner = new WorkflowRunner(workflow);

    // Mock console.log to capture printed output
    const mockLog = jest.spyOn(console, 'log');
    const mockError = jest.spyOn(console, 'error');
    mockLog.mockImplementation(() => {});
    mockError.mockImplementation(() => {});

    await runner.run();

    // Assert that console.log was called with the expected sequence (skipping the missing node)
    expect(mockLog.mock.calls).toEqual([['A'], ['B']]);

    // Assert that console.error was called
    expect(mockError.mock.calls).toEqual([['Node D not found in the workflow.']]); 

    // Restore the original implementation of console.log
    mockLog.mockRestore();
  }, 7000);

  test('handles missing start node', async () => {
    const workflow: WorkflowDAG = {
      "B": { edges: {} },
      "C": { edges: {} },
    };

    const runner = new WorkflowRunner(workflow);

    // Mock console.log to capture printed output
    const mockLog = jest.spyOn(console, 'log');
    const mockError = jest.spyOn(console, 'error');
    mockLog.mockImplementation(() => {});
    mockError.mockImplementation(() => {});

    await runner.run();

    // Assert that console.log was not called
    expect(mockLog.mock.calls).toEqual([]);

    // Assert that console.error was called
    expect(mockError.mock.calls).toEqual([['No start node found in the workflow.']]);

    // Restore the original implementation of console.log
    mockLog.mockRestore();
  });
});
