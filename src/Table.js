import React from 'react';
import './Table.css';

function Table({ data, setData, allData, grade, selectedRow, setSelectedRow, isSaved }) {
  const updateField = (id, field, value) => {
    const updatedData = data.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'credit') {
          updatedItem.attendance = 0;
          updatedItem.assignment = 0;
        }
        return updatedItem;
      }
      return item;
    });

    if (['type', 'mandatory', 'subject'].includes(field)) {
      const updatedItem = updatedData.find(item => item.id === id);
      const isDuplicate = Object.values(allData).flat().some(item => 
        item.id !== id &&
        item.type === updatedItem.type && 
        item.mandatory === updatedItem.mandatory && 
        item.subject === updatedItem.subject &&
        item.grade !== 'F' && 
        item.grade !== 'NP'
      );

      if (isDuplicate) {
        alert('동일한 과목이 이미 존재합니다. (F 학점 제외)');
        return;
      }
    }

    setData(updatedData);
  };

  const handleRowClick = (id) => {
    setSelectedRow(id === selectedRow ? null : id);
  };

  const renderRow = (item, index) => (
    <tr 
      key={item.id} 
      className={selectedRow === item.id ? 'selected' : ''}
      onClick={() => handleRowClick(item.id)}
    >
      <td>
        <select value={item.type} onChange={(e) => updateField(item.id, 'type', e.target.value)}>
          <option value="전공">전공</option>
          <option value="교양">교양</option>
        </select>
      </td>
      <td>
        <select value={item.mandatory} onChange={(e) => updateField(item.id, 'mandatory', e.target.value)}>
          <option value="필수">필수</option>
          <option value="선택">선택</option>
        </select>
      </td>
      <td>
        <input
          type="text"
          value={item.subject}
          onChange={(e) => updateField(item.id, 'subject', e.target.value)}
        />
      </td>
      <td>
        <input
          type="number"
          value={item.credit}
          onChange={(e) => updateField(item.id, 'credit', Number(e.target.value))}
          min="0"
          max="4"
        />
      </td>
      <td>
        <input
          type="number"
          value={item.attendance}
          onChange={(e) => updateField(item.id, 'attendance', Math.min(Math.max(0, Number(e.target.value)), 20))}
          min="0"
          max="20"
          disabled={item.credit === 1}
        />
      </td>
      <td>
        <input
          type="number"
          value={item.assignment}
          onChange={(e) => updateField(item.id, 'assignment', Math.min(Math.max(0, Number(e.target.value)), 20))}
          min="0"
          max="20"
          disabled={item.credit === 1}
        />
      </td>
      <td>
        <input
          type="number"
          value={item.midterm}
          onChange={(e) => updateField(item.id, 'midterm', Math.min(Math.max(0, Number(e.target.value)), item.credit === 1 ? 50 : 30))}
          min="0"
          max={item.credit === 1 ? 50 : 30}
        />
      </td>
      <td>
        <input
          type="number"
          value={item.final}
          onChange={(e) => updateField(item.id, 'final', Math.min(Math.max(0, Number(e.target.value)), item.credit === 1 ? 50 : 30))}
          min="0"
          max={item.credit === 1 ? 50 : 30}
        />
      </td>
      <td>{isSaved ? item.total : '-'}</td>
      <td>-</td>
      <td style={{ color: item.grade === 'F' || item.grade === 'NP' ? 'red' : 'black' }}>
        {isSaved ? item.grade : '-'}
      </td>
    </tr>
  );

  const renderTotalRow = () => {
    if (!isSaved) {
      return (
        <tr className="total-row">
          <td colSpan="3">합계</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
        </tr>
      );
    }

    const totalCredit = data.reduce((sum, item) => sum + item.credit, 0);
    const totalAttendance = data.reduce((sum, item) => sum + (item.credit === 1 ? 0 : item.attendance), 0);
    const totalAssignment = data.reduce((sum, item) => sum + (item.credit === 1 ? 0 : item.assignment), 0);
    const totalMidterm = data.reduce((sum, item) => sum + item.midterm, 0);
    const totalFinal = data.reduce((sum, item) => sum + item.final, 0);
    const totalScore = data.reduce((sum, item) => sum + item.total, 0);
    const avgScore = data.length ? (totalScore / data.length).toFixed(2) : 0;

    const calculateGrade = (score) => {
      if (score >= 96) return 'A+';
      else if (score >= 91) return 'A0';
      else if (score >= 86) return 'B+';
      else if (score >= 81) return 'B0';
      else if (score >= 76) return 'C+';
      else if (score >= 71) return 'C0';
      else if (score >= 66) return 'D+';
      else if (score >= 61) return 'D0';
      else return 'F';
    };

    const averageGrade = calculateGrade(avgScore);

    return (
      <tr className="total-row">
        <td colSpan="3">합계</td>
        <td>{totalCredit}</td>
        <td>{totalAttendance}</td>
        <td>{totalAssignment}</td>
        <td>{totalMidterm}</td>
        <td>{totalFinal}</td>
        <td>{totalScore}</td>
        <td>{avgScore}</td>
        <td>{averageGrade}</td>
      </tr>
    );
  };

  return (
    <table>
      <thead>
        <tr>
          <th>이수</th>
          <th>필수</th>
          <th>과목명</th>
          <th>학점</th>
          <th>출석점수</th>
          <th>과제점수</th>
          <th>중간고사</th>
          <th>기말고사</th>
          <th>총점</th>
          <th>평균</th>
          <th>성적</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => renderRow(item, index))}
        {renderTotalRow()}
      </tbody>
    </table>
  );
}

export default Table;