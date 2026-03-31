import React, { useCallback, useEffect, useRef, useState } from "react";
import useDepartments from "../../ViewModel/DepartmentsViewModel/DepartmentsServices";
import CustomButton from "../../Components/CustomButton/CustomButton";

/** Pixels from bottom of scroll area to consider "at end" and show Load more */
const SCROLL_BOTTOM_THRESHOLD_PX = 72;

const EmployeeDetails = () => {
  const {
    empDetailDept,
    empDetailDeptLoading,
    empDetailDeptLoadingMore,
    empDetailDeptPagination,
    loadMoreEmployeeDetails,
  } = useDepartments();

  const scrollRef = useRef(null);
  const [showLoadMoreAtEnd, setShowLoadMoreAtEnd] = useState(false);

  const pagination = empDetailDeptPagination || {
    page: 1,
    pages: 1,
    limit: 10,
    total: 0,
  };
  const hasMore = pagination.page < pagination.pages;

  const updateLoadMoreVisibility = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const atEnd =
      distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD_PX ||
      scrollHeight <= clientHeight;
    setShowLoadMoreAtEnd(atEnd);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !hasMore) {
      setShowLoadMoreAtEnd(false);
      return;
    }
    updateLoadMoreVisibility();
    el.addEventListener("scroll", updateLoadMoreVisibility, { passive: true });
    const ro = new ResizeObserver(updateLoadMoreVisibility);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateLoadMoreVisibility);
      ro.disconnect();
    };
  }, [hasMore, empDetailDept, updateLoadMoreVisibility]);

  if (!empDetailDept && !empDetailDeptLoading) {
    return (
      <div className="text-center py-8">
        <span className="text-gray-500">No data available.</span>
      </div>
    );
  }

  if (empDetailDeptLoading === undefined) {
    return (
      <div className="text-center py-8">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {empDetailDeptLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3da5f4]"></div>
          <span className="ml-2 text-[#3da5f4]">Loading employees...</span>
        </div>
      ) : !empDetailDept || empDetailDept.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-gray-500">
            No Employee exist in this Department.
          </span>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className={
            hasMore
              ? "max-h-[min(calc(100dvh-9rem),560px)] min-h-48 overflow-y-auto overflow-x-hidden customScroll pr-1 pb-2"
              : "pb-2"
          }
        >
          <div className="grid grid-col-2">
            {Array.isArray(empDetailDept) &&
              empDetailDept.map((data, index) => {
                if (!data) return null;

                return (
                  <div key={`emp-${data.id ?? data.emp_id ?? index}`}>
                    <div className="flex py-[20px]">
                      <div className="row-span-3">
                        <div>
                          <img
                            className="rounded-full w-[50px] h-[50px]"
                            src="https://elephant.veevotech.com/files/4d6a4d774e444930/9_9a9781ecfa76ca3.jpeg"
                            alt=""
                          />
                        </div>
                      </div>

                      <div className="px-8">
                        <div className="text-[#3da5f4] text-[14px] font-semibold">
                          {data.name || "N/A"}
                        </div>
                        <div className="text-[12px]">
                          {data?.department?.name || "N/A"}
                        </div>
                        <div className="text-[12px] text-[#9B9B9B]">
                          {data?.designation || "N/A"}
                        </div>
                      </div>
                    </div>
                    <hr />
                  </div>
                );
              })}
          </div>

          {hasMore && showLoadMoreAtEnd && (
            <div className="mt-4 border-t border-gray-100 pt-4 pb-2">
              <div className="flex flex-col items-center gap-2">
                <p className="text-[11px] text-gray-400 font-poppins">
                  Page {pagination.page} of {pagination.pages} ·{" "}
                  {pagination.total} employees
                </p>
                <CustomButton
                  type="button"
                  title={empDetailDeptLoadingMore ? "Loading…" : "Load more"}
                  loading={empDetailDeptLoadingMore}
                  onClick={() => loadMoreEmployeeDetails()}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EmployeeDetails;
