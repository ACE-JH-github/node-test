import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Close } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { collection, onSnapshot } from 'firebase/firestore';
import { IconButton, Modal, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { db } from '../../api/firebase';
import './CSS/sweetalert2.css';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ViewSubstanceListInProduct from './ViewSubstanceList';

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

export default function ViewMaterialListInProduct({ closeEvent, productId, partId }) {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentProductID, setCurrentProductID] = useState(productId);
  const [currentPartID, setCurrentPartID] = useState(partId);
  const [currentMaterialID, setCurrentMaterialID] = useState("");
  const [productSubstanceListOpen, setProductSubstanceListOpen] = useState(false);

  useEffect(() => {
    setCurrentProductID(productId);
    setCurrentPartID(partId);
  }, [productId, partId]);

  useEffect(() => {
    if (currentProductID) {
      const unsubscribe = getMaterials();
      return () => unsubscribe();  // cleanup on unmount
    }
  }, [currentProductID, currentPartID]);

  const getMaterials = () => {
    const materialCollectionRef = collection(db, 'products', productId, 'parts', partId, 'materials');
    return onSnapshot(materialCollectionRef, (snapshot) => {
      setRows(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const openSubstanceListModal = (materialId) => { // materialId를 받아와서 선택한 material의 id를 설정하고 모달을 열어주는 함수
    setCurrentMaterialID(materialId);
    setProductSubstanceListOpen(true);
  };

  const materialNames = [...new Set(rows.map((row) => row.materialname))]; // Rows에서 모든 고유한 materialname값을 가져옴 (필터 중복값 1번만 표기를 위함)

  const filterData = (v) => {
    if (v) {
      setRows(rows.filter((row) => row.materialname === v)); // 변경됨
    } else {
      getMaterials();
    }
  };

  return (
    <>
      <div>
        <IconButton style={{ position: 'absolute', top: 0, right: 0 }} onClick={closeEvent}>
          <Close />
        </IconButton>
        <Box height={10} />
        <Stack direction="row" spacing={2} className="my-2 mb-2">
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={materialNames} // 변경됨
            sx={{ width: 300 }}
            onChange={(e, v) => filterData(v)}
            renderInput={(params) => <TextField {...params} size="small" label="소재명 검색" />}
          />
        </Stack>
        <Box height={10} />
      </div>

      <div>
        {/* Substance 리스트 모달창 오픈 */}
        <Modal
          open={productSubstanceListOpen}
          onClose={() => setProductSubstanceListOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <ViewSubstanceListInProduct
              closeEvent={() => setProductSubstanceListOpen(false)}
              productID={currentProductID}
              partID={currentPartID}
              materialID={currentMaterialID}
            />
          </Box>
        </Modal>
      </div>

      {rows.length > 0 && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Typography gutterBottom variant="h5" component="div" sx={{ padding: '20px' }}>
            등록소재 리스트
          </Typography>
          <Divider sx={{ mt: 2 }} />
          <TableContainer sx={{ maxHeight: 700, maxWidth: 1600 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ minWidth: '100px' }}>
                    Material Group
                  </TableCell>
                  <TableCell align="left" style={{ minWidth: '100px' }}>
                    Material Name
                  </TableCell>
                  <TableCell align="left" style={{ minWidth: '100px' }}>
                    Recycled Contents
                  </TableCell>
                  <TableCell align="left" style={{ minWidth: '100px' }}>
                    Recycle Type
                  </TableCell>
                  <TableCell align="left" style={{ minWidth: '100px' }}>
                    Mass(g)
                  </TableCell>
                  <TableCell align="left" style={{ minWidth: '100px' }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length > 0 ? (
                  rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                        <TableCell align="left">{row.materialgroup}</TableCell>
                        <TableCell align="left">{row.materialname}</TableCell>
                        <TableCell align="left">{row.recycledcontent}</TableCell>
                        <TableCell align="left">{row.recycledtype}</TableCell>
                        <TableCell align="left">{row.materialmass}</TableCell>
                        <TableCell align="left">
                          <Stack spacing={2} direction="row">
                            {/* Action 항목 내 소재 추가 아이콘 */}
                            <ListAltIcon
                              style={{
                                fontSize: "20px",
                                color: "blue",
                                cursor: "pointer",
                              }}
                              className="cursor-pointer"
                              onClick={() => openSubstanceListModal(row.id)}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center"> {/* 6 is the total number of columns */}
                      No data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
      )}
    </>
  );
}

  // {rows.length === 0 && (
  //       <>
  //         <Paper sx={{ width: '98%', overflow: 'hidden', padding: '12px' }}>
  //           <Box height={20} />
  //           <Skeleton variant="rectangular" width={'100%'} height={30} />
  //           <Box height={40} />
  //           <Skeleton variant="rectangular" width={'100%'} height={60} />
  //           <Box height={20} />
  //           <Skeleton variant="rectangular" width={'100%'} height={60} />
  //           <Box height={20} />
  //           <Skeleton variant="rectangular" width={'100%'} height={60} />
  //           <Box height={20} />
  //           <Skeleton variant="rectangular" width={'100%'} height={60} />
  //           <Box height={20} />
  //           <Skeleton variant="rectangular" width={'100%'} height={60} />
  //           <Box height={20} />
  //         </Paper>
  //       </>
  //     )}