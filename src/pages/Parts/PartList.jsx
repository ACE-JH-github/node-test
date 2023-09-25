import * as React from 'react';
import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { ControlPointOutlined } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { db } from '../../api/firebase';
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from 'sweetalert2';
import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Modal from '@mui/material/Modal';
import AddPart from './AddPart';
import EditPart from './EditPart';
import { useAppStore } from '../appStore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PartMaterialList from './PartMaterialList';

// 모달창 스타일
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const style2 = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1200,
  height: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  zIndex: 100,
};

export default function PartList({ uid }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const partCollectionRef = collection(db, "parts");
  const [formid, setFormid] = useState('');
  const [open, setOpen] = useState(false);
  const [editopen, setEditOpen] = useState(false);
  const [viewmaterialsopen, setViewMaterialsOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleEditOpen = () => setEditOpen(true);
  const handleViewMaterialsOpen = () => setViewMaterialsOpen(true);
  const handleClose = () => setOpen(false);
  const handleEditClose = () => setEditOpen(false);
  const handleViewMaterialsClose = () => setViewMaterialsOpen(false);
  const setRows = useAppStore((state) => state.setRows);
  const rows = useAppStore((state) => state.rows);

  useEffect(() => {
    getParts();
  }, []);

  const getParts = async () => {
    try {
      const q = query(partCollectionRef, where("uid", "==", uid));
      const data = await getDocs(q);
      setRows(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (uid) {
      getParts();
    }
  }, [uid]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  const deletePart = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.value) {
        deleteApi(id);
      }
    });
  };

  const deleteApi = async (id) => {
    const userDoc = doc(db, "parts", id);
    await deleteDoc(userDoc);
    Swal.fire("Deleted!", "Your file has been deleted.", "success");
    getParts();
  };

  const filterData = (v) => {
    if (v) {
      setRows([v]);
    } else {
      setRows([]);
      getParts();
    }
  };

  const editPartData = (id, partname, partserialname, partreused, partweight, partdate, partmemo, partManagementCode, partPreprocess) => {
    const data = {
      id: id,
      name: partname,
      serialname: partserialname,
      reused: partreused,
      weight: partweight,
      date: partdate,
      memo: partmemo,
      managementCode: partManagementCode, // Add this line
      preprocess: partPreprocess
    };
    setFormid(data);
    handleEditOpen();
  };

  const viewMaterialsData = (id) => {
    setFormid(id);  // formid를 선택한 part id로 설정
    handleViewMaterialsOpen();  // ViewMaterials 모달창을 열어줍니다.
  };

  const tableHeadCellStyle = {
    align: 'center',
    style: { minWidth: '100px', borderRight: '1px solid lightgray', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
  };

  const tableBodyStyle = {
    align: 'center',
    style: { borderRight: '1px solid lightgray', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
  };

  return (
    <>
      <div>
        {/* 검색창, 등록버튼 만들기 (여기서부터) */}
        <Box height={10} />
        <Stack direction="row" spacing={2} className="my-2 mb-2">
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={rows}
            sx={{ width: 300 }}
            onChange={(e, v) => filterData(v)}
            getOptionLabel={(rows) => rows.name || ""}
            renderInput={(params) => (
              <TextField {...params} size="small" label="부품명 검색" />
            )}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          ></Typography>
          <Button variant="contained" endIcon={<ControlPointOutlined />} onClick={handleOpen}>
            부품등록
          </Button>
        </Stack>
        <Box height={10} />
        {/* 검색창 만들기 (여기까지) */}
      </div>

      <div>
        {/* 등록 버튼 클릭 시 모달창 Open 구현 */}
        <Modal
          open={open}
          // onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style2}>
            <AddPart closeEvent={handleClose} />
          </Box>
        </Modal>

        {/* Material View 버튼 클릭 시 모달창 Open 구현 */}
        <Modal
          open={viewmaterialsopen}
          // onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style2}>
            <PartMaterialList
              closeEvent={handleViewMaterialsClose}
              initialPartID={formid} />
          </Box>
        </Modal>

        {/* Edit 버튼 클릭 시 모달창 Open 구현 */}
        <Modal
          open={editopen}
          // onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style2}>
            <EditPart closeEvent={handleEditClose} fid={formid} />
          </Box>
        </Modal>
      </div>
      <div>
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {/* 부품리스트 테이블 구성 */}
          {/* 테이블 헤더부분 */}
          <TableContainer sx={{ maxHeight: 700, maxWidth: 1600 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell {...tableHeadCellStyle} >
                    Part Name
                  </TableCell>
                  <TableCell {...tableHeadCellStyle}>
                    Serial Name
                  </TableCell>
                  <TableCell {...tableHeadCellStyle}>
                    Reused Part
                  </TableCell>
                  <TableCell {...tableHeadCellStyle}>
                    Weight(g)
                  </TableCell>
                  <TableCell {...tableHeadCellStyle}>
                    Registrated Date
                  </TableCell>
                  <TableCell {...tableHeadCellStyle}>
                    Preprocessing
                  </TableCell>
                  <TableCell {...tableHeadCellStyle}>
                    Memo
                  </TableCell>
                  <TableCell {...tableHeadCellStyle}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              {/* 등록된 부품의 리스트가 표기되는 부분 */}
              <TableBody>
                {rows.length > 0 ? (
                  rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={row.partid}>
                        <TableCell {...tableBodyStyle} >
                          {row.name}
                        </TableCell>
                        <TableCell {...tableBodyStyle}>
                          {row.serialname}
                        </TableCell>
                        <TableCell {...tableBodyStyle}>
                          {row.reused}
                        </TableCell>
                        <TableCell {...tableBodyStyle} typeof='number'>
                          {row.weight}
                        </TableCell>
                        <TableCell {...tableBodyStyle}>
                          {new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(row.date))}
                        </TableCell>
                        <TableCell {...tableBodyStyle}>
                          {row.preprocess}
                        </TableCell>
                        <TableCell {...tableBodyStyle}>
                          {row.memo}
                        </TableCell>
                        <TableCell {...tableBodyStyle}>
                          <Stack spacing={2} direction="row" justifyContent="center">
                            {/* Action 항목 내 소재 추가 아이콘 */}
                            <ListAltIcon
                              style={{
                                fontSize: "20px",
                                color: "blue",
                                cursor: "pointer",
                              }}
                              className="cursor-pointer"
                              onClick={() => {
                                viewMaterialsData(row.id);
                              }}
                            />
                            {/* 부품정보 수정 아이콘 */}
                            <EditIcon
                              style={{
                                fontSize: "20px",
                                color: "blue",
                                cursor: "pointer",
                              }}
                              className="cursor-pointer"
                              onClick={() => {
                                editPartData(row.id, row.name, row.serialname, row.reused, row.weight, row.date, row.memo, row.managementCode, row.preprocess);
                              }}
                            />
                            {/* 부품 삭제 아이콘 */}
                            <DeleteIcon
                              style={{
                                fontSize: "20px",
                                color: "darkred",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                deletePart(row.id);
                              }}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell align="center" colSpan={8}>
                      No data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {/* 부품리스트 한번에 몇개씩 보이게 할건지 설정 */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </div>
    </>
  );
}





// 참고영상 : https://www.youtube.com/watch?v=BzN7rpJ_n_Q&list=PLwP3cL-MKVkNM28X96Dhc3BLMhtUktiik&index=7
// 참고문서 :
// 1. 테이블 만들기 : https://mui.com/material-ui/react-table/#data-table
// 2. 검색창 만들기 :
// 3. 부품추가 버튼 만들기 : 