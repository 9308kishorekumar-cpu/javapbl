package com.libraai.loan.controller;

import com.libraai.common.dto.ApiResponse;
import com.libraai.loan.dto.*;
import com.libraai.loan.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Circulation & Transactions", description = "Endpoints for loan issuance, returns, renewals, fines, and reservations")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping("/loans/rental-quote")
    @Operation(summary = "Get Live Rental Booking Quote", description = "Calculates total upfront rental fee and due date based on selected duration in days")
    public ApiResponse<RentalQuoteDto> getRentalQuote(
            @RequestParam Long bookId,
            @RequestParam(defaultValue = "14") int days) {
        RentalQuoteDto quote = loanService.getRentalQuote(bookId, days);
        return ApiResponse.ok(quote, "Rental quote calculated successfully");
    }

    @PostMapping("/loans/book-rental")
    @Operation(summary = "Book and Pay for Book Rental", description = "Allows a patron to book a book copy for a custom time period with upfront digital payment")
    public ApiResponse<LoanDto> bookRental(
            @Valid @RequestBody BookRentalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        LoanDto loan = loanService.bookAndPayRental(request, userDetails.getUsername());
        return ApiResponse.ok(loan, "Rental booked and payment processed successfully. Due date: " + loan.getDueDate());
    }

    @GetMapping("/books/{bookId}/bookings")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Get Book Circulation & Rental Bookings", description = "Librarian view showing who booked this book, time period, and payment verification")
    public ApiResponse<List<LoanDto>> getBookBookings(@PathVariable Long bookId) {
        List<LoanDto> bookings = loanService.getBookRentalHistory(bookId);
        return ApiResponse.ok(bookings, "Book rental bookings retrieved successfully");
    }

    @PostMapping("/loans/issue")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Issue Loan to Member", description = "Circulation desk endpoint to issue a copy to a member with limit checks")
    public ApiResponse<LoanDto> issueLoan(@Valid @RequestBody IssueLoanRequest request,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        String librarian = userDetails != null ? userDetails.getUsername() : null;
        LoanDto loan = loanService.issueLoan(request, librarian);
        return ApiResponse.ok(loan, "Book issued successfully to member: " + loan.getUsername());
    }

    @PostMapping("/loans/return")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Return Loan", description = "Returns a loaned book copy by barcode, computes overdue fines if late, and checks reservation queue")
    public ApiResponse<LoanDto> returnLoan(@Valid @RequestBody ReturnLoanRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        String librarian = userDetails != null ? userDetails.getUsername() : null;
        LoanDto loan = loanService.returnLoan(request, librarian);
        return ApiResponse.ok(loan, "Book returned successfully");
    }

    @PostMapping("/loans/{id}/return")
    @Operation(summary = "Return Loan by ID (Member Self-Return)", description = "Allows a patron to return their active loan or librarian to process return by loan ID")
    public ApiResponse<LoanDto> returnLoanById(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        LoanDto loan = loanService.returnLoanById(id, userDetails.getUsername());
        return ApiResponse.ok(loan, "Book returned successfully. Thank you!");
    }

    @PostMapping("/loans/{id}/renew")
    @Operation(summary = "Renew Active Loan", description = "Extends loan due date by 14 days if under max renewals and not overdue")
    public ApiResponse<LoanDto> renewLoan(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        LoanDto loan = loanService.renewLoan(id, userDetails.getUsername());
        return ApiResponse.ok(loan, "Loan renewed successfully. New due date: " + loan.getDueDate());
    }

    @GetMapping("/loans/my-loans")
    @Operation(summary = "Get Authenticated Member Loans", description = "Lists all current and past loans for the calling user")
    public ApiResponse<List<LoanDto>> getMyLoans(@AuthenticationPrincipal UserDetails userDetails) {
        List<LoanDto> loans = loanService.getUserLoans(userDetails.getUsername());
        return ApiResponse.ok(loans, "Member loans retrieved successfully");
    }

    @GetMapping("/loans/active")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    @Operation(summary = "Get All Active Loans", description = "Librarian view of all currently loaned copies across the library")
    public ApiResponse<List<LoanDto>> getActiveLoans() {
        List<LoanDto> loans = loanService.getActiveLoans();
        return ApiResponse.ok(loans, "Active loans retrieved successfully");
    }

    @GetMapping("/members/{id}/history")
    @Operation(summary = "Get Member Borrowing History", description = "Returns paginated loan history with multilingual book details joined in, filterable by date range and status")
    public ApiResponse<Page<LoanDto>> getMemberHistory(
            @PathVariable Long id,
            @Parameter(description = "Filter loans issued on or after this ISO date-time")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @Parameter(description = "Filter loans issued on or before this ISO date-time")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @Parameter(description = "Filter by status: ACTIVE, RETURNED, OVERDUE, LOST, ALL")
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LoanDto> history = loanService.getMemberLoanHistory(id, from, to, status, pageable, userDetails.getUsername());
        return ApiResponse.ok(history, "Member borrowing history retrieved successfully");
    }

    @GetMapping("/members/{id}/loan-stats")
    @Operation(summary = "Get Member Lifetime Loan Statistics", description = "Returns summary counts, average late days, and lifetime fine amounts")
    public ApiResponse<MemberLoanStatsDto> getMemberLoanStats(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        MemberLoanStatsDto stats = loanService.getMemberLoanStats(id, userDetails.getUsername());
        return ApiResponse.ok(stats, "Member loan statistics retrieved successfully");
    }

    @GetMapping("/fines/my-fines")
    @Operation(summary = "Get Authenticated Member Fines")
    public ApiResponse<List<FineDto>> getMyFines(@AuthenticationPrincipal UserDetails userDetails) {
        List<FineDto> fines = loanService.getUserFines(userDetails.getUsername());
        return ApiResponse.ok(fines, "Member fines retrieved successfully");
    }

    @PostMapping("/fines/{id}/pay")
    @Operation(summary = "Pay Overdue Fine")
    public ApiResponse<FineDto> payFine(@PathVariable Long id,
                                        @Valid @RequestBody PayFineRequest request) {
        FineDto fine = loanService.payFine(id, request);
        return ApiResponse.ok(fine, "Payment processed. Remaining balance: ₹" + fine.getRemainingAmount());
    }

    @PostMapping("/reservations/books/{bookId}")
    @Operation(summary = "Reserve Book Title", description = "Places the authenticated user in the queue for a book title")
    public ApiResponse<ReservationDto> createReservation(@PathVariable Long bookId,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        ReservationDto res = loanService.createReservation(bookId, userDetails.getUsername());
        return ApiResponse.ok(res, "Reservation placed successfully");
    }

    @GetMapping("/reservations/my-reservations")
    @Operation(summary = "Get Authenticated Member Reservations")
    public ApiResponse<List<ReservationDto>> getMyReservations(@AuthenticationPrincipal UserDetails userDetails) {
        List<ReservationDto> reservations = loanService.getUserReservations(userDetails.getUsername());
        return ApiResponse.ok(reservations, "Member reservations retrieved successfully");
    }

    @DeleteMapping("/reservations/{id}")
    @Operation(summary = "Cancel Reservation")
    public ApiResponse<Void> cancelReservation(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        loanService.cancelReservation(id, userDetails.getUsername());
        return ApiResponse.ok("Reservation cancelled successfully");
    }
}
