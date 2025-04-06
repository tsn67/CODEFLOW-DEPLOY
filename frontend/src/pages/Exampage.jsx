import React, { useRef } from "react";
import Examwindow from "../components/Examwindow";
import { useState, useEffect } from "react";
import { Clock, BookOpen, AlertCircle, ArrowRight } from "lucide-react";
import Button from "../components/Button";
import { initialize } from "../features/examwindow/examSlice";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {LoadingRing} from '../../src/components/animation/LoadingRing'

import Codeflowanim from "../components/animation/Codeflowanim";
import { Controller } from "../features/ExamMonitoring/Controller";
import { ExamPauseWindow } from "../components/ExamPauseWindow";

function Exampage() {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  // const [loadingAnim, setLoadingAnim] = useState(true);

  // const questionDetails = [
  //   {
  //     si: "question-1",
  //     title: "Bubble Sort",
  //     problemStatement:
  //       "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.You may assume the two numbers do not contain any leading zero, except the number 0 itself.",
  //     assumption: "you may take assumptions for granted",
  //     firstExample: "1 3 4 5 6 0",
  //     firstExampleAns: "0 1 3 4 5 6",
  //     secondExample: "1 3 4 5 6 0",
  //     secondExampleAns: "0 1 3 4 5 6",
  //     constraint1: " -100 <= num <= 100",
  //     constraint2: " -100 <= num <= 100",
  //     language: "C",
  //   },
  //   {
  //     si: "question-2",
  //     title: "Quick Sort",
  //     problemStatement:
  //       "Implement the Quick Sort algorithm to sort an array in ascending order.",
  //     assumption: "Array elements are integers",
  //     firstExample: "5 2 8 1 9",
  //     firstExampleAns: "1 2 5 8 9",
  //     secondExample: "3 7 2 1 4",
  //     secondExampleAns: "1 2 3 4 7",
  //     constraint1: " -100 <= num <= 100",
  //     constraint2: "Array length <= 1000",
  //     language: "java",
  //   },
  // ];

  // let languages = ["java", "python", "javascript", "c", "c++"];

  // const cases = [
  //   { input: ["1 2 3", "3 4 1", "2 8 3"], output: ["1 2 3", "3 4 1", "2 8 3"] },
  //   { input: ["1 2 3", "3 4 1", "2 8 3"], output: ["1 2 3", "3 4 1", "2 8 3"] },
  // ];
  const { examId } = useParams();
  const navigate = useNavigate();
  const socket = useRef();

  const rollNo = 43;
  const [duration, setDuration] = useState(0);
  const [valid, setvalid] = useState(false);
  const [rejoin, setRejoin] = useState(false);

  useEffect(() => {
    var data = null;
    async function getExamDetails() {
      const response = await axios.get(
        `https://codeflow-deploy-production.up.railway.app/exam?examId=${examId}`
      );
      
      //console.log(response.data.duration);
      setDuration(response.data.duration);
      data = response.data;
      //console.log(data);
      if (data.msg) {
        sessionStorage.setItem("errorMsg", data.msg);
        navigate("/");
      }

      
      const tempArr = [];
      data.questionDetails.map((item, index) => {
        // var questionTemp = item;
        var tempLang = data.languages;
        var codeArrTemp = [];
        data.languages.map((temp) => {
          codeArrTemp.push("//your code area");
        });
        
        var selected = 0;
        var testCases = data.cases[index];

        tempArr.push({
          questionDetails: item,
          languages: tempLang,
          codeValues: codeArrTemp,
          selected: selected,
          testCases: testCases,
          testResult: null,
          id:item.id,
        });
      });

      //reserved for intializing the redux state
      dispatch(
        initialize({ questionDetails: tempArr, selected: 0, proposedTime: 3 })
      );
      //console.log(data);
      setLoaded(true);
      // setTimeout(() => {
      //   setLoadingAnim(false);
      // }, 2000);
    }

    getExamDetails();
    //successfull data fetching from backend
    //error is not handled, will do later

    
    
  }, []);


  useEffect(() => {
    setLoaded(false);
    const timer1 = setTimeout(() => {
      setLoaded(true);
    }, 2000);
    socket.current = io("https://codeflow-deploy-production.up.railway.app", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.current.on("connect", () => {
      //("connection done!");
      socket.current.emit("identify", {
        userType: "student",
        rollNo: rollNo,
        examId: examId,
      });
    });

    socket.current.on('exam-status', (data1) => {
        //console.log(data1.validity);
        if(data1.validity == true) {
          setvalid(true);
        } else {
          setvalid(false);
          
        }
        
    });

    socket.current.on('continue-exam', (data) => {
      setWaitInfo(false);
      console.log('hello123');
    });
    
    return () => {
      socket.current.disconnect();
      clearTimeout(timer1);
      //console.log("Socket disconnected");
    };

  }, [rejoin]);

  const [isOpen, setIsOpen] = useState(true);
  const noOfQues = useSelector((state) => state["exam-data"].questions.length);
  const [timeStart, setTimeStart] = useState(false);
  const [report, setReport] = useState(false);
  const [typeReort, setType] = useState(null);

  
  useEffect(() => {
    if(report) {
      if(!valid) {
        setReport(false);
        return;
      }
      setWaitInfo(true);
      socket.current.emit('exam-cheat', {
        type: typeReort,
        rollNo: rollNo,
        examId: examId
      });  
    }
  }, [report]);


  const [waitInfo, setWaitInfo] = useState(false);

  return (
    <>
      {<Controller report={report} setReport={setReport} setType={setType}/>}
      {report && valid && <ExamPauseWindow setReport={setReport} waitingStatus={waitInfo} setWaitingStatus={setWaitInfo}/>}
      {!loaded && <LoadingRing />}
      {!valid && <div className="bg-[#15171a] h-screen w-screen absolute top-0 left-0 grid place-content-center">
        <div className="flex flex-col gap-10">
            <h1 className="text-[#c1c4c7] text-3xl">Sorry! Exam waiting time is over. You May contact your teacher !</h1>
            <div className="flex flex-row gap-6 justify-center">
                <div  className="cursor-pointer w-[90px] gap-2 h-[30px] rounded-sm box-border mr-[4px] mt-[22px] px-2 bg-[#a8dd53] hover:bg-[#5E8834] flex items-center justify-center">
                  <p>home</p>
                </div>
                <div  onClick={() => {socket.current.disconnect();setRejoin((prev) => !prev)}} className="cursor-pointer w-[90px] gap-2 h-[30px] rounded-sm box-border mr-[4px] mt-[22px] px-2 bg-[#5f97f3] hover:bg-[#1239b5] flex items-center justify-center">
                  <p>rejoin</p>
                </div>
            </div>
        </div>
      </div>}
      {loaded && valid && (
        <>
          <div
            className={`font-inter h-screen px-4 bg-black pb-[10px] ${
              isOpen ? "blur-lg" : ""
            }`}
          >
            <Examwindow report={report} duration={duration} timeStart={timeStart} studentData={{examId: examId, rollNo: rollNo}} socket={socket.current}/>
          </div>

          {isOpen && (
            <div className="z-0 fixed inset-0  flex items-center justify-center">
              <div className=" h-[350px] w-[450px] rounded-lg bg-darkGray outline outline-1 shadow-xl p-4 pt-4">
                <div className="text-center text-white">
                  <h1 className="text-2xl mb-2">Ready to begin your exam</h1>
                  <p className="text-sm text-textGray">
                    Please review the exam details below
                  </p>
                </div>

                <div className="space-y-4 flex flex-col items-center w-full max-w-md mx-auto p-4">
                  <div className="flex items-center gap-3 text-gray-300 bg-gray-800/50 w-full p-3 rounded-lg hover:bg-gray-800/70 transition-colors">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">{duration} minutes</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-300 bg-gray-800/50 w-full p-3 rounded-lg hover:bg-gray-800/70 transition-colors">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">
                      {noOfQues} numbers of question
                    </span>
                  </div>

                  <div className="flex items-start gap-3 bg-amber-900/20 w-full p-2 rounded-lg border border-amber-500/20">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-300">
                      Once started, the exam cannot be paused. Ensure you have a
                      stable internet connection and sufficient time.
                    </p>
                  </div>

                  <Button
                    iconStyle={{ size: 14, className: " translate-y-0 " }}
                    Icon={ArrowRight}
                    label={"START"}
                    disabled={false}
                    buttonClass={" text-black bg-[#A8FF53] hover:shadow-xl"}
                    action={() => {
                      setIsOpen(false), setTimeStart(true);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Exampage;
