import React from "react";

const SortOptions = ({ sortOption, onChangeSort }) => {
    return (
        <div className="SortOptions">
            <label>Sortuj:</label>
            <select onChange={(e) => onChangeSort(e.target.value)} value={sortOption}>
                <option value="latest">Najnowsze</option>
                <option value="popular">Najwięcej lajków</option>
                <option value="followed">Obserwowani</option>
            </select>
        </div>
    );
};

export default SortOptions;
