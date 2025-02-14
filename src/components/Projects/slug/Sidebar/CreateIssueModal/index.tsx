import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  UseModalProps,
  Button,
  Heading,
  Box,
  Container,
  Text,
  Input,
  FormControl,
  Tooltip,
  FormErrorMessage,
  Spinner,
  Flex,
  Tag,
  TagLabel,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { IoCheckbox, IoCopy, IoAlertCircleSharp } from "react-icons/io5";
import {
  BiChevronUp,
  BiChevronDown,
  BiChevronsUp,
  BiChevronsDown,
} from "react-icons/bi";
import { HiMenuAlt4 } from "react-icons/hi";

import { TextEditor } from "../../../../TextEditor";
import { AssigneesSelect } from "./AssigneesSelect";

import { useIssues } from "../../../../../contexts/IssuesContext";
import { useAuth } from "../../../../../contexts/AuthContext";
import { useProjects } from "../../../../../contexts/ProjectsContext";
import { useNotifications } from "../../../../../contexts/NotificationsContext";

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Project {
  id: string;
  userId: string;
  title: string;
  type: string;
  description?: string;
  leader: UserData;
  assignees?: Array<UserData>;
  createdAt: string;
}

interface CreateIssueModalProps extends UseModalProps {
  project: Project;
}

function CreateIssueModal({ isOpen, onClose, project }: CreateIssueModalProps) {
  const { colorMode } = useColorMode(); 
  const { user, getAllUsers } = useAuth();
  const { createIssue, updatedIssueListener } = useIssues();
  const { updateProject } = useProjects();
  const { createNotification } = useNotifications();

  const [isLoading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [assignees, setAssignees] = useState<Array<UserData>>([]);
  const [projectAssignees, setProjectAssignees] = useState<Array<UserData>>([]);
  const [priority, setPriority] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm();

  const formValidations = {
    type: {
      required: "Tipo obrigatório",
    },
    summary: {
      onChange: (e: any) => setSummary(e.target.value),
      value: summary,
    },
    priority: {
      required: "Prioridade obrigatória",
    },
  };

  async function onSubmit() {
    setLoading(true);
    try {
      await createIssue({
        projectId: project?.id,
        status,
        type,
        priority,
        summary,
        user,
        assignees,
        description,
      });

      if (projectAssignees.length > 0) {
        await updateProject({
          id: project?.id,
          assignees: projectAssignees,
        });
      }

      if (assignees.length > 0) {
        assignees.map(async (assignee) => {
          await createNotification({
            type: "issue",
            userId: assignee.id,
            content: `${user.name} criou um problema para você, no projeto ${project.title}.`,
          });
        });
      }
    } finally {
      updatedIssueListener(project.id);
      onModalClose();
      setLoading(false);
    }
  }

  async function onModalClose() {
    setSummary("");
    setType("");
    setDescription("");
    setAssignees([]);
    setProjectAssignees([]);
    setPriority("");
    reset();
    onClose();
  }

  useEffect(() => {
    getAllUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIssueType = useCallback(() => {
    switch (type) {
      case "tarefa":
        return (
          <Flex alignItems="center">
            <Icon as={IoCheckbox} mr="12px" w={5} h={5} color="#4bade8" />
            <Text>Tarefa</Text>
          </Flex>
        );
      case "subtarefa":
        return (
          <Flex alignItems="center">
            <Icon as={IoCopy} mr="12px" w={5} h={5} color="green.400" />
            <Text>Subtarefa</Text>
          </Flex>
        );
      case "erro":
        return (
          <Flex alignItems="center">
            <Icon
              as={IoAlertCircleSharp}
              mr="12px"
              w={5}
              h={5}
              color="red.500"
            />
            <Text>Erro</Text>
          </Flex>
        );
      default:
        return (
          <Flex alignItems="center">
            <Text ml="8px" fontSize="16px">
              Selecione
            </Text>
          </Flex>
        );
    }
  },[type])

  const getIssuePriority = useCallback(()=>{
    switch (priority) {
      case "muito alta":
        return (
          <Flex alignItems="center">
            <Icon mr="12px" as={BiChevronsUp} w={5} h={5} color="red.500" />
            <Text>Muito alta</Text>
          </Flex>
        );
      case "alta":
        return (
          <Flex alignItems="center">
            <Icon mr="12px" as={BiChevronUp} w={5} h={5} color="red.400" />
            <Text>Alta</Text>
          </Flex>
        );
      case "media":
        return (
          <Flex alignItems="center">
            <Icon mr="12px" as={HiMenuAlt4} w={5} h={5} color="orange.500" />
            <Text>Média</Text>
          </Flex>
        );
      case "baixa":
        return (
          <Flex alignItems="center">
            <Icon mr="12px" as={BiChevronDown} w={5} h={5} color="green.400" />
            <Text>Baixa</Text>
          </Flex>
        );
      case "muito baixa":
        return (
          <Flex alignItems="center">
            <Icon mr="12px" as={BiChevronsDown} w={5} h={5} color="green.500" />
            <Text>Muito Baixa</Text>
          </Flex>
        );
      default:
        return (
          <Flex alignItems="center">
            <Text ml="8px" fontSize="16px">
              Selecione
            </Text>
          </Flex>
        );
    }
  },[priority])

  return (
    <>
      <Modal trapFocus={false} size="3xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent 
        p="10px"
        bg={colorMode === "dark" ? "dark.200" : "white"}
        borderColor={colorMode === "dark" ? "rgba(255, 255, 255, 0.24)" : "none"}
        borderWidth={colorMode === "dark" ? "1px" : "0"}
        >
          <ModalHeader pl="36px">
            <Heading variant="modal-title">Criar problema</Heading>
          </ModalHeader>
          <ModalCloseButton m="15px 10px 0 0" />
          <ModalBody>
            <Box as="form" onSubmit={handleSubmit(onSubmit)} mb="20px">
              <Container maxWidth="750px">
                <Box mb="20px">
                  <Text fontWeight="500" mb="5px">
                    Tipo de Problema
                  </Text>
                  <FormControl
                    h="40px"
                    mb="5px"
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    isInvalid={!!errors.type}
                  >
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<Icon as={BiChevronDown} w={5} h={5} />}
                        h="40px"
                        bgColor={colorMode === "dark" ? "rgba(153, 153, 153,0.175)" : "gray.50"}
                        fontSize="14px"
                        fontWeight="400"
                        borderWidth={!!errors.type ? "2px" : "1px"}
                        borderColor={!!errors.type ? "red.500" : colorMode === "dark" ? "#202024" : "#E2E8F0"}
                        textAlign="left"
                        pl="10px"
                        pr="10px"
                        w="100%"
                        _hover={{
                          bgColor: colorMode === "dark" ? "rgba(153, 153, 153,0.175)" : "gray.50",
                          borderColor: colorMode === "dark" ? "dark.300" : "gray.300",
                        }}
                        {...register("type", formValidations.type)}
                        value={type}
                        _focus={{
                          outline: "none",
                          boxShadow: "none",
                        }}
                      >
                        {getIssueType()}
                      </MenuButton>
                      <MenuList 
                      w="500px"
                      bg={colorMode === "dark" ? "dark.200" : "white"}
                      >
                        <MenuItem
                          minH="40px"
                          onClick={() => {
                            clearErrors("type");
                            return setType("tarefa");
                          }}
                        >
                          <Flex alignItems="center">
                            <Icon
                              as={IoCheckbox}
                              mr="12px"
                              w={5}
                              h={5}
                              color="#4bade8"
                            />
                            <Text>Tarefa</Text>
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          minH="40px"
                          onClick={() => {
                            clearErrors("type");
                            return setType("subtarefa");
                          }}
                        >
                          <Flex alignItems="center">
                            <Icon
                              as={IoCopy}
                              mr="12px"
                              w={5}
                              h={5}
                              color="green.400"
                            />
                            <Text>Subtarefa</Text>
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          minH="40px"
                          onClick={() => {
                            clearErrors("type");
                            return setType("erro");
                          }}
                        >
                          <Flex alignItems="center">
                            <Icon
                              as={IoAlertCircleSharp}
                              mr="12px"
                              w={5}
                              h={5}
                              color="red.500"
                            />
                            <Text>Erro</Text>
                          </Flex>
                        </MenuItem>
                      </MenuList>
                    </Menu>

                    {!!errors.type && (
                      <Tooltip
                        label={errors.type?.message}
                        placement="right"
                        fontSize="13px"
                        fontFamily="Inter"
                      >
                        <FormErrorMessage
                          transform="translateX(-20px)"
                          ml={-7}
                          mt={-0.5}
                          zIndex="tooltip"
                        >
                          <InfoOutlineIcon color="red.500" w={4} h={4} />
                        </FormErrorMessage>
                      </Tooltip>
                    )}
                  </FormControl>
                </Box>
                <Text fontWeight="500" mb="5px">
                  Pequeno resumo
                </Text>
                <Input
                  mb="5px"
                  pl="20px"
                  bgColor={colorMode === "dark" ? "rgba(153, 153, 153,0.175)" : "gray.50"}
                  color={colorMode === "dark" ? "white" : "gray.700"}
                  borderColor={colorMode === "dark" ? "dark.300" : "gray.200"}
                  borderWidth="1px"
                  {...register("summary", formValidations.summary)}
                  focusBorderColor="main.500"
                />
                <Text
                  font-size="12px"
                  lineHeight="15px"
                  color="light.600"
                  mb="20px"
                >
                  Resuma concisamente o problema em uma ou duas frases.
                </Text>

                <Text fontWeight="500" mb="5px">
                  Descrição
                </Text>
                <TextEditor
                  setTempDescription={setDescription}
                  tempDescription={description}
                />
                <Text
                  font-size="12px"
                  lineHeight="15px"
                  color="light.600"
                  mb="20px"
                >
                  Descreva o problema com os detalhes que desejar.
                </Text>

                <Text fontWeight="500" mb="15px">
                  Líder
                </Text>

                <Tag 
                size="lg" 
                borderRadius="full" 
                mb="20px" 
                bgColor={colorMode === "dark" ? "rgba(153, 153, 153,0.175)" : "gray.200"}
                >
                  <Avatar
                    src={user.avatar}
                    size="xs"
                    name={user.name}
                    ml={-1}
                    mr={2}
                  />
                  <TagLabel>{user.name}</TagLabel>
                </Tag>

                <Text fontWeight="500" mb="5px">
                  Responsáveis
                </Text>

                <Box w="100%" mb="20px">
                  <AssigneesSelect
                    setAssignees={setAssignees}
                    project={project}
                    setProjectAssignees={setProjectAssignees}
                  />
                </Box>

                <Box mb="5px">
                  <Text fontWeight="500" mb="5px">
                    Prioridade
                  </Text>
                  <FormControl
                    h="40px"
                    mb="5px"
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    isInvalid={!!errors.priority}
                  >
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<Icon as={BiChevronDown} w={5} h={5} />}
                        h="40px"
                        bgColor={colorMode === "dark" ? "rgba(153, 153, 153,0.175)" : "gray.50"}
                        fontSize="14px"
                        fontWeight="400"
                        borderWidth={!!errors.priority ? "2px" : "1px"}
                        borderColor={!!errors.type ? "red.500" : colorMode === "dark" ? "#202024" : "#E2E8F0"}
                        textAlign="left"
                        pl="10px"
                        pr="10px"
                        w="100%"
                        value={priority}
                        {...register("priority", formValidations.priority)}
                        _focus={{
                          outline: "none",
                          boxShadow: "none",
                        }}
                        _hover={{
                          bgColor: colorMode === "dark" ? "rgba(153, 153, 153,0.175)" : "gray.50",
                          borderColor: colorMode === "dark" ? "dark.300" : "gray.300",
                        }}
                      >
                        {getIssuePriority()}
                      </MenuButton>
                      <MenuList 
                      w="500px"
                      bg={colorMode === "dark" ? "dark.200" : "white"}
                      >
                        <MenuItem
                          minH="40px"
                          onClick={() => {
                            clearErrors("priority");
                            return setPriority("muito alta");
                          }}
                        >
                          <Flex alignItems="center">
                            <Icon
                              mr="12px"
                              as={BiChevronsUp}
                              w={5}
                              h={5}
                              color="red.500"
                            />
                            <Text>Muito alta</Text>
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          minH="40px"
                          onClick={() => {
                            clearErrors("priority");
                            return setPriority("alta");
                          }}
                        >
                          <Flex alignItems="center">
                            <Icon
                              mr="12px"
                              as={BiChevronUp}
                              w={5}
                              h={5}
                              color="red.400"
                            />
                            <Text>Alta</Text>
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          minH="40px"
                          onClick={() => {
                            clearErrors("priority");
                            return setPriority("media");
                          }}
                        >
                          <Flex alignItems="center">
                            <Icon
                              mr="12px"
                              as={HiMenuAlt4}
                              w={5}
                              h={5}
                              color="orange.500"
                            />
                            <Text>Média</Text>
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          minH="40px"
                          onClick={() => {
                            clearErrors("priority");
                            return setPriority("baixa");
                          }}
                        >
                          <Flex alignItems="center">
                            <Icon
                              mr="12px"
                              as={BiChevronDown}
                              w={5}
                              h={5}
                              color="green.400"
                            />
                            <Text>Baixa</Text>
                          </Flex>
                        </MenuItem>
                        <MenuItem
                          minH="40px"
                          onClick={() => {
                            clearErrors("priority");
                            return setPriority("muito baixa");
                          }}
                        >
                          <Flex alignItems="center">
                            <Icon
                              mr="12px"
                              as={BiChevronsDown}
                              w={5}
                              h={5}
                              color="green.500"
                            />
                            <Text>Muito Baixa</Text>
                          </Flex>
                        </MenuItem>
                      </MenuList>
                    </Menu>

                    {!!errors.priority && (
                      <Tooltip
                        label={errors.priority?.message}
                        placement="right"
                        fontSize="13px"
                        fontFamily="Inter"
                      >
                        <FormErrorMessage
                          transform="translateX(-20px)"
                          ml={-7}
                          mt={-0.5}
                          zIndex="tooltip"
                        >
                          <InfoOutlineIcon color="red.500" w={4} h={4} />
                        </FormErrorMessage>
                      </Tooltip>
                    )}
                  </FormControl>
                </Box>
                <Text
                  font-size="12px"
                  lineHeight="15px"
                  color="light.600"
                  mb="30px"
                >
                  Prioridade em relação a outros problemas.
                </Text>

                <Flex justifyContent="flex-end" mb="20px">
                  <Button
                    variant="modal-cancel"
                    w="120px"
                    onClick={onModalClose}
                    mr="10px"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="modal-submit"
                    type="submit"
                    w="120px"
                  >
                    {isLoading ? <Spinner color="white" /> : "Criar"}
                  </Button>
                </Flex>
              </Container>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export { CreateIssueModal };
