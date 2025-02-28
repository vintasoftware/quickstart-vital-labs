import { VStack, Heading, Text, Box, Button, Table, TableContainer, Thead, Tr, Th, Tbody, Td } from "@chakra-ui/react";
import { useState } from "react";
import { Card } from "../Card";
import { CreateLabTestTemplateDialog } from "./CreateLabTestTemplateDialog";

// Define the interface for a test within a template
interface TemplateTest {
  name: string;
  description: string;
}

// Define the interface for a template
interface LabTestTemplate {
  id: number;
  name: string;
  description: string;
  tests: TemplateTest[];
}

interface LabTestTemplatesProps {
  initialTemplates?: LabTestTemplate[];
}

export const LabTestTemplates = ({ initialTemplates = [] }: LabTestTemplatesProps) => {
  const [templates, setTemplates] = useState<LabTestTemplate[]>(initialTemplates);
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null);

  const toggleTemplateExpansion = (templateId: number) => {
    if (expandedTemplate === templateId) {
      setExpandedTemplate(null);
    } else {
      setExpandedTemplate(templateId);
    }
  };

  return (
    <Card>
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
              templates.map((template: any) => (
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
                              {template.tests.map((test: any, idx: any) => (
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
  );
}; 