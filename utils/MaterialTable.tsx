import React from "react";
import styled from "styled-components";

interface Material {
  name: string;
  properties: {
    Density: string;
    "Printing Temperature": string;
    "Bed Temperature": string;
    Strength: string;
    Flexibility: string;
  };
  cost: {
    per_gram: number;
    per_hour: number;
    color_options: string[];
  };
}

interface MaterialTableProps {
  materials: Material[];
}

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  color: white;
`;

const Th = styled.th`
  background: #1e2a38;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #333;
`;

const Td = styled.td`
  padding: 12px;
  font-size: 14px;
  border: 1px solid #333;
  text-align: center;
`;

const MaterialTable: React.FC<MaterialTableProps> = ({ materials }) => {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Material</Th>
          <Th>Density</Th>
          <Th>Printing Temp</Th>
          <Th>Bed Temp</Th>
          <Th>Strength</Th>
          <Th>Flexibility</Th>
          <Th>Cost per Gram</Th>
          <Th>Cost per Hour</Th>
          <Th>Colors</Th>
        </tr>
      </thead>
      <tbody>
        {materials.map((material) => (
          <tr key={material.name}>
            <Td>{material.name}</Td>
            <Td>{material.properties.Density}</Td>
            <Td>{material.properties["Printing Temperature"]}</Td>
            <Td>{material.properties["Bed Temperature"]}</Td>
            <Td>{material.properties.Strength}</Td>
            <Td>{material.properties.Flexibility}</Td>
            <Td>₹{material.cost.per_gram}</Td>
            <Td>₹{material.cost.per_hour}</Td>
            <Td>{material.cost.color_options.join(", ")}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default MaterialTable;
