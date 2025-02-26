import { VStack, Heading, HStack, Text, Box, Button, Table, TableContainer, TableCaption, Thead, Tr, Th, Tbody, Td } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { OrderTestDialog } from "./OrderTestDialog";
import { Card } from "../Card";
import { CreateLabTestTemplateDialog } from "./CreateLabTestTemplateDialog";

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

// Add sample template data
const defaultTemplatesList = [
    {
        id: 1,
        name: "Basic Health Panel",
        description: "Standard health checkup tests",
        tests: [
            { name: "Complete Blood Count", description: "Measures blood cells and components" },
            { name: "Lipid Panel", description: "Measures cholesterol and triglycerides" },
            { name: "Glucose Test", description: "Measures blood sugar levels" }
        ]
    },
    {
        id: 2,
        name: "Cardiac Panel",
        description: "Tests for heart health assessment",
        tests: [
            { name: "Troponin", description: "Detects heart damage" },
            { name: "CK-MB", description: "Enzyme released during heart attack" }
        ]
    }
];

export const LabOrders = () => {
  // You can use this state to store lab test data when you have it
  const [tests, setTests] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  useEffect(() => {
    setTests(defaultTestsList);
    setTemplates(defaultTemplatesList);
  }, []);
  
  const toggleTemplateExpansion = (templateId) => {
    if (expandedTemplate === templateId) {
      setExpandedTemplate(null);
    } else {
      setExpandedTemplate(templateId);
    }
  };
  
  return (
    <HStack width={"100%"} alignItems="stretch" height="100%">
        <VStack width="50%" height="100%">
            <Card height="100%">
                <Heading>Lab Test Orders</Heading>
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
                </Card>
            </VStack>
            <VStack width="50%" height="100%">
                <Card height="100%">
                    <Heading size="md" mb={4}>Lab Test Templates</Heading>
                    <Box><CreateLabTestTemplateDialog /></Box>
                    <TableContainer width="100%">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Template Name</Th>
                                    <Th>Description</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {templates.length > 0 ? (
                                    templates.map((template) => (
                                        <>
                                            <Tr key={template.id} cursor="pointer" onClick={() => toggleTemplateExpansion(template.id)}>
                                                <Td fontWeight="bold">{template.name}</Td>
                                                <Td>{template.description}</Td>
                                                <Td>
                                                    <Button size="sm" colorScheme="blue" mr={2}>Edit</Button>
                                                    <Button size="sm" colorScheme="red">Delete</Button>
                                                </Td>
                                            </Tr>
                                            {expandedTemplate === template.id && (
                                                <Tr>
                                                    <Td colSpan={3} p={0}>
                                                        <Box pl={8} pr={4} py={2} bg="gray.50">
                                                            <Text fontWeight="medium" mb={2}>Included Tests:</Text>
                                                            <Table size="sm" variant="simple">
                                                                <Thead>
                                                                    <Tr>
                                                                        <Th>Test Name</Th>
                                                                        <Th>Description</Th>
                                                                    </Tr>
                                                                </Thead>
                                                                <Tbody>
                                                                    {template.tests.map((test, idx) => (
                                                                        <Tr key={idx}>
                                                                            <Td>{test.name}</Td>
                                                                            <Td>{test.description}</Td>
                                                                        </Tr>
                                                                    ))}
                                                                </Tbody>
                                                            </Table>
                                                        </Box>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={3} textAlign="center">No templates available</Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Card>
            </VStack>
        </HStack>
  );
};
