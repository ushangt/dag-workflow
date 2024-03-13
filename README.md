# dag-workflow
Workflow runner that can accept the specification of a workflow in the form of a DAG.

# Assumptions and Validations
1. The workflow runner expects an object of the following type:
```
{
    "A": {"start": true, "edges": {"B": 5, "C": 7}},
    "B": {"edges": {}},
    "C": {"edges": {}}
}
```
Number of edges for each node are not a limiting factor. The runner expects a start node to be provided. If not it logs an error.
2. The workflow runner expects a true DAG (ie. no cycles). If a cycle is encountered, the runner will throw an exception.
3. The workflow runner expects non-negative weighted edges. If a negative edge is encountered, the runner will throw an exception.

# Pre-requisites
This project requires node v18+ and npm v9+.

# Setup & startup instructions
Clone repo and and run `npm install`.

To run the example workflow:
`npm start`.

In order to add  test different workflows, please modify the `main.ts` file.

# Testing
Jest tests are setup for this project. In order to run tests, please run:
`npm test`
Please note that various test scenarios are tested as a part of the test suite. Since the tests run for long (because of the waits), kindly expect the test suite to take sometime to execute fully.
