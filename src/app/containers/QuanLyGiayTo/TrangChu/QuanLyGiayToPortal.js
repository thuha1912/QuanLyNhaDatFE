import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./QuanLyGiayToPortal.scss";
import BaseContent from "@components/BaseContent";
import queryString, { stringify } from "query-string";
import { getAllGiayToCapMoi } from "@app/services/CapMoiGiayTo";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import SearchBar from "@containers/SearchBar";
import { URL } from "@url";
import { formatSTT, getChangeFormSearch } from "@app/common/functionCommons";
import { SEARCH_STATUS_THAM_DINH, PAGINATION_CONFIG, VI_STATUS_THAM_DINH } from "@constants";
import { Button, Table } from "antd";
import { connect } from "react-redux";
import VisibleIcon from "@components/Icons/VisibleIcon";
QuanLyGiayToPortal.propTypes = {};

function QuanLyGiayToPortal({ isLoading }) {
  const history = useHistory();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);
  useEffect(() => {
    getDataFilter();
  }, [location.search]);
  useEffect(() => {
    handleRefresh({}, true);
  }, [page, limit]);
  const getDataFilter = async () => {
    const search = queryString.parse(location.search);
    let queryStr = "";
    queryStr += `${search.tennguoisudung ? "&tennguoisudung[like]={0}".format(search.tennguoisudung) : ""}`;
    queryStr += `${search.diachithuongtru ? "&diachithuongtru[like]={0}".format(search.diachithuongtru) : ""}`;
    queryStr += `${search.status ? "&status={0}".format(search.status) : ""}`;
    // queryStr += `${search.active ? "&active={0}".format(search.active) : ""}`;
    const apiResponse = await getAllGiayToCapMoi(page, limit, queryStr);
    if (apiResponse) {
      const dataRes = apiResponse.docs;
      setData(dataRes);
      setLimit(apiResponse.limit);
      setPage(apiResponse.page);
      setTotalDocs(apiResponse.totalDocs);
    }
  };
  const handleRefresh = (newQuery, changeTable) => {
    const { pathname } = location;
    let objFilterTable = { page, limit };
    if (changeTable) {
      newQuery = queryString.parse(location.search);
      delete newQuery.page;
      delete newQuery.limit;
    }
    if (getChangeFormSearch(newQuery, queryString.parse(location.search))) {
      objFilterTable.page = 1;
    }
    newQuery = Object.assign(objFilterTable, newQuery);
    history.push({ pathname, search: stringify({ ...newQuery }, { arrayFormat: "repeat" }) });
  };
  const dataSearch = [
    {
      name: "tennguoisudung",
      label: "Tên người sử dụng",
      type: "text",
      operation: "like",
    },
    {
      name: "diachithuongtru",
      label: "Địa chỉ thường trú",
      type: "text",
      operation: "like",
    },
    {
      type: "select",
      name: "status",
      label: "Kết quả thẩm định",
      options: SEARCH_STATUS_THAM_DINH,
      key: "value",
      value: "name",
    },
  ];
  const onChangeTable = (page) => {
    setLimit(page.pageSize);
    setPage(page.current);
  };
  const onClickThemMoi = () => {
    history.push(URL.THEM_MOI_GIAY_TO);
  };
  const ColumnDonVi = [
    {
      title: "STT",
      render: (v1, v2, value) => formatSTT(limit, page, value),
      key: "STT",
      align: "center",
      width: 60,
    },
    { title: "Tên người sử dụng đất", dataIndex: "tennguoisudung", key: "tennguoisudung" },
    { title: "Địa chỉ thường trú", dataIndex: "diachithuongtru", key: "diachithuongtru" },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      width: 170,
      render: (_, value) => {
        return (
          <div className={`action_dv color-status-${value.status}`}>
            <span>{VI_STATUS_THAM_DINH[value.status]}</span>
          </div>
        );
      },
    },
    {
      title: "Tác vụ",
      key: "action",
      align: "center",
      width: 100,
      render: (_, value) => {
        return (
          <div className="action-dv">
            <Button
              icon={<VisibleIcon />}
              style={{ border: 0 }}
              onClick={() => {
                history.push(URL.THEM_MOI_GIAY_TO_ID.format(value._id));
              }}
            ></Button>
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <BaseContent>
        <div className="QuanLyGiayToPortal-container">
          <div className="header">
            <div className="header-title">
              <span>Quản lý giấy tờ cấp mới</span>
            </div>
            <SearchBar
              dataSearch={dataSearch}
              onFilterChange={handleRefresh}
              buttonHeader={true}
              labelButtonHeader={"Thêm giấy tờ mới"}
              handleBtnHeader={onClickThemMoi}
            />
          </div>
          <div className="content">
            {data && !isLoading && (
              <Table
                bordered
                className="table"
                showHeader={true}
                columns={ColumnDonVi}
                dataSource={data}
                scroll={{ x: 900 }}
                pagination={{
                  ...PAGINATION_CONFIG,
                  current: page,
                  pageSize: limit,
                  total: totalDocs,
                }}
                onChange={onChangeTable}
              />
            )}
          </div>
        </div>
      </BaseContent>
    </div>
  );
}
function mapStateToProps(store) {
  const { isLoading } = store.app;
  return { isLoading };
}
export default connect(mapStateToProps)(QuanLyGiayToPortal);

