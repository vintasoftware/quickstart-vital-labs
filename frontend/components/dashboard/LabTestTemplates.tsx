import { VStack, Button, Heading, Text, Box, Table, TableContainer, Thead, Tr, Th, Tbody, Td } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Card } from "../Card";
import { CreateLabTestTemplateDialog } from "./CreateLabTestTemplateDialog";
import { fetcher } from "../../lib/client";
import useSWR from "swr";

// Define the interface for a test within a template
interface TemplateTest {
  id: number;
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

interface Marker {
  id: number;
  name: string;
  description: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
}

interface LabTestTemplatesProps {
  initialTemplates?: LabTestTemplate[];
}

export const LabTestTemplates = ({ initialTemplates = [] }: LabTestTemplatesProps) => {
  const [templates, setTemplates] = useState<LabTestTemplate[]>(initialTemplates);
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null);
  const { data } = useSWR("/tests/", fetcher);

  useEffect(() => {
    if (data) {
      setTemplates(data);
    }
  }, [data]);

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
              <Th>Biomarkers</Th>
            </Tr>
          </Thead>
          <Tbody>
            {templates?.length > 0 ? (
              templates.map((template: LabTestTemplate) => (
                  <Tr key={template.id}>
                    <Td fontWeight="bold">{template?.name}</Td>
                    <Td minWidth="275px" maxWidth="275px">
                      <Button onClick={() => toggleTemplateExpansion(template.id)}>View Biomarkers</Button>
                      {expandedTemplate === template.id && (
                        <Tr key={`${template.id}-markers`}>
                          <Td colSpan={3} p={0}>
                            <Box pl={8} pr={4} py={2} bg="gray.50">
                              <MarkersList templateId={template.id} />
                            </Box>
                          </Td>
                        </Tr>
                      )}</Td>
                  </Tr>
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

const MarkersList = ({ templateId }: { templateId: number }) => {
  const { data: markerData } = useSWR(
    `/tests/markers/${templateId}/`,
    fetcher
  );

  if (!markerData) {
    return <Text fontSize="sm" color="gray.500">Loading markers...</Text>;
  }

  return (
    <VStack align="start" spacing={1} style={{ "text-wrap": "wrap", "margin-top": "10px" }}>
      {markerData.markers?.map((marker: Marker) => (
        <Text key={marker.id} fontSize="sm">
          • {marker.name}
        </Text>
      ))}
    </VStack>
  );
}; 