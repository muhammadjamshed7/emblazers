import { useQuery, useMutation } from "@tanstack/react-query";
import { type Route, type Vehicle, type Driver, type StudentTransport, type InsertRoute, type InsertVehicle, type InsertDriver, type InsertStudentTransport } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  MapPin,
  Bus,
  Users,
  UserCheck,
} from "lucide-react";

export const transportNavItems = [
  { label: "Dashboard", path: "/transport/dashboard", icon: LayoutDashboard },
  { label: "Routes", path: "/transport/routes", icon: MapPin },
  { label: "Vehicles", path: "/transport/vehicles", icon: Bus },
  { label: "Drivers", path: "/transport/drivers", icon: Users },
  { label: "Student Allocation", path: "/transport/allocation", icon: UserCheck },
];

export function useTransportData() {
  const { data: routes = [], isLoading: routesLoading, error: routesError } = useQuery<Route[]>({
    queryKey: ['/api/routes']
  });
  
  const { data: vehicles = [], isLoading: vehiclesLoading, error: vehiclesError } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles']
  });
  
  const { data: drivers = [], isLoading: driversLoading, error: driversError } = useQuery<Driver[]>({
    queryKey: ['/api/drivers']
  });
  
  const { data: allocations = [], isLoading: allocationsLoading, error: allocationsError } = useQuery<StudentTransport[]>({
    queryKey: ['/api/student-transports']
  });

  const createRouteMutation = useMutation({
    mutationFn: async (data: InsertRoute) => {
      const res = await apiRequest('POST', '/api/routes', data);
      return res.json() as Promise<Route>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/routes'] })
  });

  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Route> }) => {
      const res = await apiRequest('PATCH', `/api/routes/${id}`, updates);
      return res.json() as Promise<Route>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/routes'] })
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      const res = await apiRequest('POST', '/api/vehicles', data);
      return res.json() as Promise<Vehicle>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] })
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Vehicle> }) => {
      const res = await apiRequest('PATCH', `/api/vehicles/${id}`, updates);
      return res.json() as Promise<Vehicle>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] })
  });

  const createDriverMutation = useMutation({
    mutationFn: async (data: InsertDriver) => {
      const res = await apiRequest('POST', '/api/drivers', data);
      return res.json() as Promise<Driver>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/drivers'] })
  });

  const updateDriverMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Driver> }) => {
      const res = await apiRequest('PATCH', `/api/drivers/${id}`, updates);
      return res.json() as Promise<Driver>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/drivers'] })
  });

  const createAllocationMutation = useMutation({
    mutationFn: async (data: InsertStudentTransport) => {
      const res = await apiRequest('POST', '/api/student-transports', data);
      return res.json() as Promise<StudentTransport>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/student-transports'] })
  });

  const updateAllocationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StudentTransport> }) => {
      const res = await apiRequest('PATCH', `/api/student-transports/${id}`, updates);
      return res.json() as Promise<StudentTransport>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/student-transports'] })
  });

  const addRoute = async (route: InsertRoute): Promise<Route> => {
    return await createRouteMutation.mutateAsync(route);
  };

  const updateRoute = async (id: string, updates: Partial<Route>) => {
    await updateRouteMutation.mutateAsync({ id, updates });
  };

  const addVehicle = async (vehicle: InsertVehicle): Promise<Vehicle> => {
    return await createVehicleMutation.mutateAsync(vehicle);
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    await updateVehicleMutation.mutateAsync({ id, updates });
  };

  const addDriver = async (driver: InsertDriver): Promise<Driver> => {
    return await createDriverMutation.mutateAsync(driver);
  };

  const updateDriver = async (id: string, updates: Partial<Driver>) => {
    await updateDriverMutation.mutateAsync({ id, updates });
  };

  const addAllocation = async (allocation: InsertStudentTransport): Promise<StudentTransport> => {
    return await createAllocationMutation.mutateAsync(allocation);
  };

  const updateAllocation = async (id: string, updates: Partial<StudentTransport>) => {
    await updateAllocationMutation.mutateAsync({ id, updates });
  };

  const getRoute = (id: string) => routes.find((r) => r.id === id);
  const getVehicle = (id: string) => vehicles.find((v) => v.id === id);

  return { 
    routes, 
    vehicles, 
    drivers, 
    allocations, 
    addRoute, 
    updateRoute, 
    addVehicle, 
    updateVehicle, 
    addDriver, 
    updateDriver, 
    addAllocation, 
    updateAllocation, 
    getRoute, 
    getVehicle,
    isLoading: routesLoading || vehiclesLoading || driversLoading || allocationsLoading,
    error: routesError ?? vehiclesError ?? driversError ?? allocationsError,
    isPending: createRouteMutation.isPending || updateRouteMutation.isPending || createVehicleMutation.isPending || updateVehicleMutation.isPending || createDriverMutation.isPending || updateDriverMutation.isPending || createAllocationMutation.isPending || updateAllocationMutation.isPending
  };
}

export const vehicleTypes = ["Bus", "Van", "Mini Bus"] as const;
export const vehicleStatuses = ["Active", "Maintenance", "Inactive"] as const;
