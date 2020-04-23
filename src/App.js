import React, { useState } from "react";
import "./App.css";
import { foodCombinations, foods } from "./combinations";

function App() {
  const [combo, setCombo] = useState([]);
  const [foodLists, setFoodLists] = useState([foods]);
  const [foodComboLists, setFoodComboLists] = useState([foodCombinations]);
  const [filters, setFilters] = useState([""]);

  return (
    <div className="App">
      <h1>Matkombo</h1>
      <div className="Lists">
        {[...combo, "all"].map((selected, i) => {
          return foodLists.length > i && foodLists[i].length ? (
            <div key={i} className="Level">
              <div className="InputContainer">
                <input
                  placeholder="Filtrer ..."
                  value={filters[i]}
                  onChange={(e) =>
                    setFilters([
                      ...filters.slice(0, i),
                      e.target.value || "",
                      ...filters.slice(i + 1),
                    ])
                  }
                />
                <button
                  className={"Reset" + (filters[i] ? "" : " hidden")}
                  onClick={() => {
                    setFilters([
                      ...filters.slice(0, i),
                      "",
                      ...filters.slice(i + 1),
                    ]);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="List">
                {foodLists[i]
                  .filter(
                    (food) => food.indexOf(filters[i].toLowerCase()) !== -1
                  )
                  .map((food) => (
                    <div
                      className={
                        "Item" + (food === combo[i] ? " selected" : "")
                      }
                      key={food}
                      onClick={() => {
                        setCombo([...combo.slice(0, i), food]);
                        setFilters([...filters.slice(0, i + 1), ""]);
                        const availableFoodCombinations = foodComboLists[
                          i
                        ].filter((fc) => fc.includes(food));
                        setFoodComboLists([
                          ...foodComboLists.slice(0, i + 1),
                          availableFoodCombinations,
                        ]);
                        setFoodLists([
                          ...foodLists.slice(0, i + 1),
                          foodLists[i].filter(
                            (f) =>
                              f !== food &&
                              availableFoodCombinations.some((fc) =>
                                fc.includes(f)
                              )
                          ),
                        ]);
                      }}
                    >
                      <FoodItem
                        level={i}
                        food={food}
                        foodComboList={foodComboLists[i]}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

export default App;

function FoodItem({ level, food, foodComboList }) {
  if (level === 0) {
    return <span className="more">{food}</span>;
  } else {
    const comboItems = foodComboList.filter((fc) => fc.includes(food));
    const comboItem = comboItems.find((c) => c.length - 2 === level);
    const existsMore = comboItems.some((c) => c.length - 2 > level);
    if (comboItem) {
      if (typeof comboItem[0] === "object") {
        return (
          <>
            <span className={existsMore ? "more" : ""}>{food}</span>
            <span className="Description">
              {comboItem[0].description ? (
                <>
                  {comboItem[0].description}
                  <br />
                </>
              ) : null}
              {(comboItem[0].tags || []).map((tag) => (
                <span key={tag} className="Tag">
                  {tag}
                </span>
              ))}
            </span>
          </>
        );
      }
      return <span className={existsMore ? "more" : ""}>{food}</span>;
    }
    return <span className={existsMore ? "more" : ""}>{food}</span>;
  }
}
