import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td } from "@chakra-ui/react";
import { useState, useEffect } from "react";

// Define the test type
interface LabTest {
  name: string;
  date: string;
  user: string;
  status: string;
}

interface LabTestOrdersTableProps {
  tests: LabTest[];
}

export const LabTestOrdersTable = ({ tests }: LabTestOrdersTableProps) => {
  return (
    <TableContainer>
      <Table variant="simple">
        <TableCaption>Lab Tests Orders</TableCaption>
        <Thead>
          <Tr>
            <Th>Test Name</Th>
            <Th>Date</Th>
            <Th>User</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tests.length > 0 ? (
            tests.map((test: any, index: any) => (
              <Tr key={index}>
                <Td>{test.name}</Td>
                <Td>{test.date}</Td>
                <Td>{test.user}</Td>
                <Td>{test.status}</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={4} textAlign="center">No lab tests available</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}; 