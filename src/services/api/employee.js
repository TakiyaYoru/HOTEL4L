import api from '../utils/api';
import { API_ENDPOINTS } from '../constants';
import { formatDateForApi } from '../utils/format';

// Lấy danh sách nhân viên
export const fetchEmployees = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.EMPLOYEES.BASE);
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết của một nhân viên
export const fetchEmployeeById = async (employeeId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.EMPLOYEES.BASE}/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee with id ${employeeId}:`, error);
    throw error;
  }
};

// Tạo nhân viên mới
export const createEmployee = async (employeeData) => {
  try {
    const employeePayload = {
      employeeID: employeeData.employeeID,
      eName: employeeData.name,
      dob: formatDateForApi(employeeData.dob),
      hireDate: formatDateForApi(employeeData.hireDate),
      salary: employeeData.salary,
      email: employeeData.email,
      phone: employeeData.phone,
      managerID: employeeData.managerID
    };

    const response = await api.post(API_ENDPOINTS.EMPLOYEES.BASE, employeePayload);
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

// Cập nhật thông tin nhân viên
export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const employeePayload = {
      eName: employeeData.name,
      dob: formatDateForApi(employeeData.dob),
      hireDate: formatDateForApi(employeeData.hireDate),
      salary: employeeData.salary,
      email: employeeData.email,
      phone: employeeData.phone,
      managerID: employeeData.managerID
    };

    const response = await api.put(`${API_ENDPOINTS.EMPLOYEES.BASE}/${employeeId}`, employeePayload);
    return response.data;
  } catch (error) {
    console.error(`Error updating employee with id ${employeeId}:`, error);
    throw error;
  }
};

// Xóa nhân viên
export const deleteEmployee = async (employeeId) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.EMPLOYEES.BASE}/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting employee with id ${employeeId}:`, error);
    throw error;
  }
};

// Lấy danh sách ca làm việc
export const fetchShifts = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.EMPLOYEES.SHIFTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
};

// Lấy ca làm việc của một nhân viên
export const fetchEmployeeShifts = async (employeeId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.EMPLOYEES.SHIFTS}?employeeID=${employeeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching shifts for employee ${employeeId}:`, error);
    throw error;
  }
};

// Tạo ca làm việc mới
export const createShift = async (shiftData) => {
  try {
    const shiftPayload = {
      shiftDate: formatDateForApi(shiftData.date),
      shiftOrder: shiftData.order,
      employeeID: shiftData.employeeId
    };

    const response = await api.post(API_ENDPOINTS.EMPLOYEES.SHIFTS, shiftPayload);
    return response.data;
  } catch (error) {
    console.error('Error creating shift:', error);
    throw error;
  }
};

// Cập nhật ca làm việc
export const updateShift = async (shiftId, shiftData) => {
  try {
    const shiftPayload = {
      shiftDate: formatDateForApi(shiftData.date),
      shiftOrder: shiftData.order,
      employeeID: shiftData.employeeId
    };

    const response = await api.put(`${API_ENDPOINTS.EMPLOYEES.SHIFTS}/${shiftId}`, shiftPayload);
    return response.data;
  } catch (error) {
    console.error(`Error updating shift with id ${shiftId}:`, error);
    throw error;
  }
};

// Xóa ca làm việc
export const deleteShift = async (shiftId) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.EMPLOYEES.SHIFTS}/${shiftId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting shift with id ${shiftId}:`, error);
    throw error;
  }
};

// Lấy thống kê nhân viên
export const fetchEmployeeStatistics = async (employeeId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.EMPLOYEES.BASE}/${employeeId}/statistics`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching statistics for employee ${employeeId}:`, error);
    throw error;
  }
};

// Lấy danh sách nhân viên theo quản lý
export const fetchEmployeesByManager = async (managerId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.EMPLOYEES.BASE}?managerID=${managerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employees for manager ${managerId}:`, error);
    throw error;
  }
};

// Lấy lịch làm việc của nhân viên
export const fetchEmployeeSchedule = async (employeeId, startDate, endDate) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.EMPLOYEES.BASE}/${employeeId}/schedule`, {
      params: {
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate)
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching schedule for employee ${employeeId}:`, error);
    throw error;
  }
};

// Lấy thống kê hiệu suất nhân viên
export const fetchEmployeePerformance = async (employeeId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.EMPLOYEES.BASE}/${employeeId}/performance`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching performance for employee ${employeeId}:`, error);
    throw error;
  }
};
