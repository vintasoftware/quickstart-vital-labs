import { VStack, Heading, HStack, Text, Box, Button, Table, TableContainer, TableCaption, Thead, Tr, Th, Tbody, Td } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { OrderTestDialog } from "./OrderTestDialog";
const defaultTestsList = [
    {
        name: "Test 1",
        date: "2021-01-01",
        user: "John Doe",
        status: "Pending",
    },
    {
        name: "Test 2",
        date: "2021-01-02",
        user: "Jane Doe",
        status: "Completed",
    },
];

export const LabTestsTable = () => {
  // You can use this state to store lab test data when you have it
  const [tests, setTests] = useState([]);

  useEffect(() => {
    setTests(defaultTestsList);
  }, []);
  
  return (
    <VStack>
        <Box><OrderTestDialog /></Box>
        <TableContainer>
        <Table variant="simple">
            <TableCaption>Lab Tests Results</TableCaption>
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
                tests.map((test, index) => (
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
    </VStack>
  );
};
