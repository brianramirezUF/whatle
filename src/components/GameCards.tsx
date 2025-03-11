
'use client'
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import agentsage from './images/6480-agentsage.png';  

const GameplayBoard = () => {
  const [rows, setRows] = useState(3);  
  const [cols, setCols] = useState(3);  

  const handleRowChange = (e: React.ChangeEvent<HTMLInputElement>) => setRows(Number(e.target.value));
  const handleColChange = (e: React.ChangeEvent<HTMLInputElement>) => setCols(Number(e.target.value));

  const renderHeaders = () => (
    <>
    <div></div>
      {/* <div className="bg-gray-100 text-center font-bold p-2 border">#</div> */}
      {Array.from({ length: cols }).map((_, col) => (
        <div
          key={`header-${col}`}>
            <Card className="bg-gray-100 text-center font-bold p-2 border">
          Attribute {col + 1}
          </Card>
        </div>
      ))}
    </>
  );

  const renderRows = () => {
    const rowsArr = [];
    for (let row = 0; row < rows; row++) {
      rowsArr.push(
        <React.Fragment key={`row-${row}`}>
          <div>
            <Card  className="p-2 bg-gray-100 flex font-bold items-center justify-center aspect-square min-w-[100px]">
          {/* <Card className="bg-gray-100 text-center items-center font-bold p-2 border aspect-square min-w-[100px]">  */}
          <CardContent className="text-center">
            Guess {row + 1}
            <img src={agentsage.src} alt="sage" className="w-52 h-auto" /> 

          </CardContent>
            </Card>
          </div>
          {Array.from({ length: cols }).map((_, col) => (
            <Card
              key={`${row}-${col}`}
              className="p-2 shadow-md flex items-center justify-center border aspect-square min-w-[100px] transition-colors"
              style={{ backgroundColor: "" }}> 
            {/* backgroundColor: "lightgray", or 
            success: bg-lime-300 or 200
            fail: bg-red-300
            partial: bg-amber-200
            */}
              <CardContent className="text-center">
                Character {row + 1}, Attribute {col + 1}
              </CardContent>
            </Card>
          ))}
        </React.Fragment>
      );
    }
    return rowsArr;
  };

  return (
    <div className="flex justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl mb-2 font-bold text-center">Gameplay Board</h2>
          <div className="mb-2 flex justify-center">
            <label className="mr-2">Number of Guesses (Rows):</label>
            <input
              type="number"
              value={rows}
              onChange={handleRowChange}
              className="border rounded p-1 mr-4"
              min="1"
            />
            <label className="mr-2">Number of Attributes (Columns):</label>
            <input
              type="number"
              value={cols}
              onChange={handleColChange}
              className="border rounded p-1"
              min="1"
            />
          </div>
        </div>

        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${cols + 1}, minmax(100px, 1fr))`,
          }}
        >
          {renderHeaders()}
          {renderRows()}
        </div>
      </div>
    </div>
  );
};

export default GameplayBoard;
