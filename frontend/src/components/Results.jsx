import React from 'react'
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react'
import axios from 'axios'

function Results({ examId, onClose, studentId, examName }) {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [resultData, setResultData] = useState(null)


  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // Fetch results first

        const resultsResponse = await axios.get(
          `https://codeflow-deploy-production.up.railway.app/getResultForStudent?sid=${studentId}&eid=${examId}`
        );
        const results = resultsResponse.data;
        console.log(results)


        // Then fetch exam details
        const examResponse = await axios.get(
          `https://codeflow-deploy-production.up.railway.app/exam?examId=${examId}`
        );
        const data = examResponse.data.questionDetails;
        console.log(examResponse.data)

        // Format the data
        const formattedData = data.map((question) => {
          const result = results.find((res) => res.question_id === question.id);

          return {
            question_id: question.id,
            title: question.title,
            problemStatement: question.description,
            result: result
              ? {
                partial_output: result.partial_output,
                testcases_passed: result.testcases_passed,
                total_testcases: result.total_testcases,
                score: result.score,
                submission_date: result.submission_date,
                code: result.code_values
              }
              : null, // In case no result is found
          };
        });

        // Set the result data
        setResultData(formattedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching exam data:", error);
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, [studentId, examId]);




  //   useEffect(() => {
  //     if (process.env.NODE_ENV === 'development') {
  //       const mockData = {
  //         examName: "Operating Systems Midterm",
  //         examDate: "2025-03-15",
  //         courseCode: "CST-332",
  //         totalTestCases: 18,
  //         totalPassed: 14,
  //         questions: [
  //           {
  //             id: 1,
  //             title: "Process Scheduler Implementation",
  //             description: "Implement a Round Robin process scheduler with a time quantum of 4 units.",
  //             testCasesPassed: 3,
  //             totalTestCases: 5,
  //             submittedCode: `function roundRobinScheduler(processes, timeQuantum = 4) {
  //   let time = 0;
  //   let completed = 0;
  //   const n = processes.length;
  //   const remainingTime = [...processes.map(p => p.burstTime)];
  //   const waitingTime = Array(n).fill(0);
  //   const turnaroundTime = Array(n).fill(0);
  //   const queue = [];

  //   // Initially add all processes to queue
  //   for (let i = 0; i < n; i++) {
  //     if (processes[i].arrivalTime === 0) {
  //       queue.push(i);
  //     }
  //   }

  //   while (completed < n) {
  //     if (queue.length === 0) {
  //       time++;
  //       // Check if any new processes arrived
  //       for (let i = 0; i < n; i++) {
  //         if (processes[i].arrivalTime === time && remainingTime[i] > 0) {
  //           queue.push(i);
  //         }
  //       }
  //       continue;
  //     }

  //     const current = queue.shift();

  //     for (let i = 0; i < timeQuantum; i++) {
  //       time++;
  //       remainingTime[current]--;

  //       // Check if any new processes arrived
  //       for (let i = 0; i < n; i++) {
  //         if (processes[i].arrivalTime === time && remainingTime[i] > 0) {
  //           queue.push(i);
  //         }
  //       }

  //       if (remainingTime[current] === 0) {
  //         completed++;
  //         turnaroundTime[current] = time - processes[current].arrivalTime;
  //         waitingTime[current] = turnaroundTime[current] - processes[current].burstTime;
  //         break;
  //       }
  //     }

  //     if (remainingTime[current] > 0) {
  //       queue.push(current);
  //     }
  //   }

  //   return {
  //     averageWaitingTime: waitingTime.reduce((a, b) => a + b, 0) / n,
  //     averageTurnaroundTime: turnaroundTime.reduce((a, b) => a + b, 0) / n
  //   };
  // }`
  //           },
  //           {
  //             id: 2,
  //             title: "Memory Management",
  //             description: "Implement the Best-Fit memory allocation algorithm.",
  //             testCasesPassed: 5,
  //             totalTestCases: 5,
  //             submittedCode: `function bestFitMemoryAllocation(blocks, processes) {
  //   const allocation = Array(processes.length).fill(-1);

  //   // For each process
  //   for (let i = 0; i < processes.length; i++) {
  //     let bestFitIdx = -1;

  //     // Find the best fit block
  //     for (let j = 0; j < blocks.length; j++) {
  //       if (blocks[j] >= processes[i]) {
  //         if (bestFitIdx === -1) {
  //           bestFitIdx = j;
  //         } else if (blocks[j] < blocks[bestFitIdx]) {
  //           bestFitIdx = j;
  //         }
  //       }
  //     }

  //     // If we found a block for the process
  //     if (bestFitIdx !== -1) {
  //       allocation[i] = bestFitIdx;
  //       blocks[bestFitIdx] -= processes[i];
  //     }
  //   }

  //   return allocation;
  // }`
  //           },
  //           {
  //             id: 3,
  //             title: "Page Replacement Algorithm",
  //             description: "Implement the Least Recently Used (LRU) page replacement algorithm.",
  //             testCasesPassed: 3,
  //             totalTestCases: 4,
  //             submittedCode: `function lruPageReplacement(pages, capacity) {
  //   const frames = [];
  //   const pageFaults = [];

  //   for (let i = 0; i < pages.length; i++) {
  //     const page = pages[i];

  //     // If page is already in a frame
  //     if (frames.includes(page)) {
  //       // Move the page to the end (most recently used position)
  //       const index = frames.indexOf(page);
  //       frames.splice(index, 1);
  //       frames.push(page);
  //       pageFaults.push(false);
  //     } 
  //     // If frames have space
  //     else if (frames.length < capacity) {
  //       frames.push(page);
  //       pageFaults.push(true);
  //     } 
  //     // Need to replace a page
  //     else {
  //       // Remove the least recently used page (first item)
  //       frames.shift();
  //       frames.push(page);
  //       pageFaults.push(true);
  //     }
  //   }

  //   return {
  //     totalFaults: pageFaults.filter(fault => fault).length,
  //     faultSequence: pageFaults
  //   };
  // }`
  //           },
  //           {
  //             id: 4,
  //             title: "Deadlock Detection",
  //             description: "Implement a deadlock detection algorithm using resource allocation graphs.",
  //             testCasesPassed: 3,
  //             totalTestCases: 4,
  //             submittedCode: `function detectDeadlock(allocation, request, available) {
  //   const n = allocation.length; // Number of processes
  //   const m = available.length;  // Number of resource types

  //   // Copy of available resources
  //   const work = [...available];

  //   // Array to track if process is finished
  //   const finish = Array(n).fill(false);

  //   // Find processes that can complete
  //   let safeSequence = [];
  //   let count = 0;

  //   while (count < n) {
  //     let found = false;

  //     for (let i = 0; i < n; i++) {
  //       if (!finish[i]) {
  //         let j;
  //         for (j = 0; j < m; j++) {
  //           if (request[i][j] > work[j]) {
  //             break;
  //           }
  //         }

  //         // If all resources for this process can be granted
  //         if (j === m) {
  //           // Add allocated resources back to available
  //           for (let k = 0; k < m; k++) {
  //             work[k] += allocation[i][k];
  //           }

  //           safeSequence.push(i);
  //           finish[i] = true;
  //           found = true;
  //           count++;
  //         }
  //       }
  //     }

  //     // If we couldn't find any process to execute, deadlock exists
  //     if (!found) {
  //       // Return deadlocked processes
  //       return {
  //         hasDeadlock: true,
  //         deadlockedProcesses: finish.map((f, idx) => !f ? idx : -1).filter(idx => idx !== -1)
  //       };
  //     }
  //   }

  //   return {
  //     hasDeadlock: false,
  //     safeSequence: safeSequence
  //   };
  // }`
  //           }
  //         ]
  //       };

  //       setExamData(mockData);
  //       setLoading(false);
  //     }
  //   }, [loading]);

  if (isLoading || !resultData) {
    return <div>Loading results...</div>;
  }

  const selectedQuestion = resultData[selectedQuestionIndex];
  console.log(selectedQuestion)
  const totalPassed = resultData.reduce((acc, question) => acc + (question.result?.testcases_passed || 0), 0);
  const totalTestCases = resultData.reduce((acc, question) => acc + (question.result?.total_testcases || 0), 0);
  const overallScore = totalTestCases > 0 ? Math.round((totalPassed / totalTestCases) * 100) : 0;

  return (
    <div className="bg-black text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mt-2">{resultData.title}</h1>
          <div className="flex gap-4 mt-2">
            <div className="text-gray-400">{resultData.courseCode}</div>
            <div className="text-white">
              <h1 className='text-3xl font-semibold'>
                {examName}
              </h1>
              {/* Exam Date: {new Date(resultData[0]?.result?.submission_date).toISOString().split("T")[0]} */}
            </div>

          </div>
        </div>
        <div className="bg-black border border-gray-800 p-4 rounded">
          <div className="text-3xl font-bold text-center">{overallScore}%</div>
          <div className="text-sm text-gray-400 text-center">OVERALL SCORE</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-black border border-gray-800 p-4 rounded">
          <div className="flex items-center">
            <div className="text-2xl mr-4">✓</div>
            <div>
              <div className="text-2xl font-bold">
                {totalPassed} / {totalTestCases}
              </div>
              <div className="text-sm text-gray-400">TEST CASES PASSED</div>
            </div>
          </div>
        </div>
        <div className="bg-black border border-gray-800 p-4 rounded">
          <div className="flex items-center">
            <div className="text-2xl mr-4">📝</div>
            <div>
              <div className="text-2xl font-bold">{resultData.length}</div>
              <div className="text-sm text-gray-400">NO OF QUESTIONS</div>
            </div>
          </div>
        </div>
        <div className="bg-black border border-gray-800 p-4 rounded">
          <div className="flex items-center">
            <div className="text-2xl mr-4">⏱️</div>
            <div>
              <div className="text-2xl font-bold">
                {new Date(resultData[0]?.result?.submission_date).toISOString().split("T")[0]}
              </div>
              <div className="text-sm text-gray-400">SUBMISSION DATE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Questions Panel */}
        <div className="bg-black border border-gray-800 rounded overflow-hidden">
          <div className="p-3 border-b border-gray-800 font-medium flex justify-between">
            <span>Questions</span>
            <span className="bg-black border border-gray-800 px-2 rounded text-sm">
              {resultData.length}
            </span>
          </div>
          <div className="overflow-y-auto">
            {resultData.map((question, index) => (
              <div
                key={question.id}
                className={`p-4 border-b border-gray-800 cursor-pointer transition-colors ${selectedQuestionIndex === index ? 'bg-black border-l-4 border-l-[#A8FF53]' : ''
                  }`}
                onClick={() => setSelectedQuestionIndex(index)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="inline-block bg-black border border-gray-800 text-white rounded w-6 h-6 text-center text-sm mr-2">
                      {index + 1}
                    </span>
                    {question.title}
                  </div>
                  {/* <div className="text-sm">
                    <span className={question.result.testcases_passed === question.result.total_testcases ? 'text-[#A8FF53]' : 'text-white'}>
                      {question.result.testcases_passed}/{question.result.total_testcases}
                    </span>
                  </div> */}
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-[#A8FF53]"
                      style={{ width: `${(question.result.testcases_passed / question.result.total_testcases) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="progress-info mt-1 flex justify-between text-xs text-gray-400">
                  <span>Progress</span>
                  <span>{Math.round((question.result.testcases_passed / question.result.total_testcases) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Display */}
        <div className="col-span-3 bg-black border border-gray-800 rounded overflow-hidden">
          <div className="p-3 border-b border-gray-800 font-medium flex justify-between items-center">
            <div >
              <div className="tab active">Source Code</div>
            </div>
            <div className="text-sm">
              <span className={selectedQuestion.result.testcases_passed === selectedQuestion.result.total_testcases ? 'text-[#A8FF53]' : 'text-white'}>
                {selectedQuestion.result.testcases_passed}/{selectedQuestion.result.total_testcases} Test Cases Passed
              </span>
            </div>
          </div>

          <div className="p-4 border-b border-gray-800">
            <h3 className="text-lg font-medium mb-2">{selectedQuestion.title}</h3>
            <p className="text-gray-400">{selectedQuestion.problemStatement}</p>
          </div>

          <div className="h-96">
            <Editor
              className="p-3 rounded h-full"
              value={selectedQuestion.result.code}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                lineNumbers: "on",
                disableAutoFocus: true,
                automaticLayout: true,
              }}
              wrapperProps={{
                className: 'h-full w-full', // Add height and width classes
                style: {
                  pointerEvents: 'none',
                  height: '100%',
                  width: '100%'
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Assessment Section */}
      <div className="mt-6 bg-black border border-gray-800 rounded overflow-hidden">
        <div className="p-3 border-b border-gray-800 font-medium flex justify-between items-center">
          <div className="summary-title">
            <span>🔍</span> Exam Assessment
          </div>
        </div>
        <div className="p-4 text-white overflow-auto">
          <h3 className="text-lg font-medium mb-2">Performance Analysis</h3>
          <p className="text-gray-400">
            none more info to be added by ai
          </p>
        </div>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
        onClick={onClose}
      >
        Back
      </button>
    </div>
  );
}

export default Results  