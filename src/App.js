import React, { useState, useEffect } from 'react';
import Table from './Table';
import './App.css';

function App() {
  const [grade, setGrade] = useState(1);
  const [data, setData] = useState({
    1: [],
    2: [],
    3: []
  });
  const [selectedRow, setSelectedRow] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const savedData = localStorage.getItem('gradeData');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gradeData', JSON.stringify(data));
  }, [data]);

  const handleGradeChange = (event) => {
    setGrade(Number(event.target.value));
    setSelectedRow(null);
    setIsSaved(false);
  };

  const addRow = () => {
    const newRow = {
      id: Date.now(),
      type: '교양',
      mandatory: '선택',
      subject: '',
      credit: 0,
      attendance: 0,
      assignment: 0,
      midterm: 0,
      final: 0,
      total: 0,
      grade: ''
    };

    const isDuplicate = Object.values(data).flat().some(item => 
      item.type === newRow.type && 
      item.mandatory === newRow.mandatory && 
      item.subject === newRow.subject &&
      item.grade !== 'F' && 
      item.grade !== 'NP'
    );

    if (isDuplicate) {
      setErrorMessage('동일한 과목이 이미 존재합니다. (F 학점 제외)');
      setTimeout(() => setErrorMessage(''), 3000);
    } else {
      setData((prevData) => ({
        ...prevData,
        [grade]: [...prevData[grade], newRow]
      }));
      setIsSaved(false);
    }
  };

  const deleteSelectedRow = () => {
    if (selectedRow !== null) {
      setData((prevData) => ({
        ...prevData,
        [grade]: prevData[grade].filter(row => row.id !== selectedRow)
      }));
      setSelectedRow(null);
      setIsSaved(false);
    }
  };

  const saveData = () => {
    const sortData = (dataToSort) => {
      return [...dataToSort].sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "전공" ? -1 : 1;
        }
        if (a.mandatory !== b.mandatory) {
          return a.mandatory === "필수" ? -1 : 1;
        }
        return a.subject.localeCompare(b.subject);
      });
    };

    const updatedData = Object.keys(data).reduce((acc, gradeKey) => {
      acc[gradeKey] = sortData(data[gradeKey].map((item) => {
        const total = item.attendance + item.assignment + item.midterm + item.final;
        const grade = calculateGrade(total, item.credit);
        return { ...item, total, grade };
      }));
      return acc;
    }, {});
    
    setData(updatedData);
    setIsSaved(true);
  };
  
  const calculateGrade = (total, credit) => {
    if (credit === 1) return total >= 50 ? 'P' : 'NP';
    if (total >= 96) return 'A+';
    else if (total >= 91) return 'A0';
    else if (total >= 86) return 'B+';
    else if (total >= 81) return 'B0';
    else if (total >= 76) return 'C+';
    else if (total >= 71) return 'C0';
    else if (total >= 66) return 'D+';
    else if (total >= 61) return 'D0';
    else return 'F';
  };

  return (
    <div className="App">
      <h1>성적 관리 시스템</h1>
      
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      
      <div className="control-panel">
        <div className="grade-select">
          <label>학년 선택: </label>
          <select value={grade} onChange={handleGradeChange}>
            <option value={1}>1학년</option>
            <option value={2}>2학년</option>
            <option value={3}>3학년</option>
          </select>
        </div>

        <div className="table-buttons">
          <button onClick={addRow}>추가</button>
          <button onClick={deleteSelectedRow} disabled={selectedRow === null}>삭제</button>
          <button onClick={saveData}>저장</button>
        </div>
      </div>

      <Table 
        data={data[grade]} 
        setData={(updatedData) => 
          setData((prevData) => ({
            ...prevData,
            [grade]: updatedData
          }))
        } 
        allData={data}
        grade={grade}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        isSaved={isSaved}
      />
    </div>
  );
}

export default App;